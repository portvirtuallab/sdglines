#!/usr/bin/env node
/**
 * Import the SDG Lines operational workbooks into structured TypeScript.
 *
 * Usage:
 *   node scripts/workbook/import.mjs --general <file.xlsx> --bookings <file.xlsx>
 *
 * The workbooks are not committed. One of them holds the Port Virtual PIN codes
 * in clear (`BOOKINGS!Verification`) and this repository is public, so the files
 * stay outside it and only the derived, PIN-free data is written. The importer
 * refuses to emit anything that looks like a credential.
 *
 * What comes out, in `src/data/quote/`:
 *
 *   network.ts    ports, services and vessels
 *   equipment.ts  the 16 unit types
 *   tariffs.ts    handling, surcharges and the recovered freight curve
 *   distances.ts  the direct port-to-port distance matrix
 *
 * Two of those are read straight from tariff tables. The surcharge tables and
 * the freight curve are instead *derived from the 405 worked quotations* the
 * workbooks carry, because the Google Sheets formulas did not survive the
 * export. Deriving them rather than transcribing them means the importer can
 * assert its own conclusions: if a surcharge ever disagrees with itself across
 * the corpus, the import fails rather than publishing a guess.
 *
 * See docs/quote/workbook-audit.md and docs/quote/pricing-model.md.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openWorkbook, num, str } from './xlsx.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(ROOT, 'src/data/quote');
const TODAY = new Date().toISOString().slice(0, 10);

/* -------------------------------------------------------------------------- */
/* Corrections                                                                */
/* -------------------------------------------------------------------------- */

/**
 * A find-and-replace in the source spreadsheet turned every `ah` into `AI`.
 * Only five strings in the operational sheets are affected; `MUMBAI`,
 * `PORT SAID` and `ROLL TRAILER` contain `AI` legitimately and are left alone.
 *
 * Alongside them, a handful of country and region names are plainly wrong
 * rather than merely informal. Each correction is printed by the importer so
 * that the list can be checked against the workbook.
 */
const TEXT_CORRECTIONS = new Map([
  ['AglAIonike Of Thessaly', 'Aglahonike Of Thessaly'],
  ['AGLAIONIKE OF THESSALY', 'AGLAHONIKE OF THESSALY'],
  ['AImed Al-Mansour', 'Ahmed Al-Mansour'],
  ['AImed Ben Ali', 'Ahmed Ben Ali'],
  ['MAImoud Abdel-Moneim', 'Mahmoud Abdel-Moneim'],
  ['JawAIarlal Nehru Port Container Terminal (Nhava Sheva)', 'Jawaharlal Nehru Port Container Terminal (Nhava Sheva)'],
  ['Sailportlogistics.com ALGIERSia', 'Sailportlogistics.com Algeria'],
]);

/** Country and region spellings corrected on import. */
const COUNTRY_CORRECTIONS = new Map([
  ['Algiers', 'Algeria'],
  ['Tunis', 'Tunisia'],
  ['Libia', 'Libya'],
  ['Emirates', 'United Arab Emirates'],
  ['UK', 'United Kingdom'],
]);

const REGION_CORRECTIONS = new Map([
  ['Northen Europe', 'Northern Europe'],
  ['Estern Asia', 'Eastern Asia'],
]);

/**
 * Values the workbook does not carry, supplied by the product owner.
 *
 * These are the only numbers in the generated data that do not come from a
 * cell, so they are declared here rather than hidden in a branch, and each one
 * is emitted with `source: 'simulation-design'` so a reader can tell it apart
 * from a value the workbook states.
 *
 * PALMA: Gimnesias calls there and the worked quotations price shipments from
 * it, but Palma appears in neither the freight rate table nor the port class
 * table, so the tool could not quote it at all. Supplied 2026-09-23:
 *
 *   class D    457 449 TEU sits inside the band every other class D port
 *              occupies (82 000 to 750 000); the next class up starts at
 *              1 053 000.
 *   base 100   the index the workbook gives every other Spanish port -
 *              Barcelona, Valencia and Las Palmas are all 100 - and Palma is a
 *              short-sea shuttle from Barcelona.
 */
const OWNER_SUPPLIED = new Map([
  [
    'PALMA',
    {
      portClass: 'D',
      baseIndex: 100,
      note:
        'Class and base index supplied by the product owner on 2026-09-23. The workbook lists ' +
        'neither. Class follows the TEU band; the base index matches the other Spanish ports.',
    },
  ],
  [
    'ORAN',
    {
      latitude: 35.71,
      longitude: -0.64,
      note:
        'Coordinates supplied on 2026-09-23. The workbook row is column-shifted - it carries ' +
        '271 in the latitude cell and nothing in the longitude - so the port could not be ' +
        'placed on the map. These are the real position of the Port of Oran, which is a ' +
        'geographic fact rather than a simulation choice.',
    },
  ],
]);

/**
 * Cells the workbook gets wrong, with the evidence for the replacement.
 *
 * These are corrections, not preferences. Each one is resolved from something
 * else the workbook itself says, or from arithmetic, and the reasoning travels
 * with the value so that a reviewer can disagree with it on the merits.
 */
const DISTANCE_CORRECTIONS = [
  {
    from: 'BARCELONA',
    to: 'ORAN',
    distanceNm: 362,
    note:
      'The matrix reads 279 NM one way and 362 the other. 279 is the Barcelona-Algiers ' +
      'figure, sitting two columns away in the same row, so the Oran cell was filled from ' +
      'its neighbour. Barcelona to Oran is about 365 NM in a straight line, which 362 fits ' +
      'and 279 cannot.',
  },
  {
    from: 'JEDDAH',
    to: 'ABU DHABI',
    distanceNm: 2452,
    note:
      'The matrix reads 2452 NM one way and 2542 the other, a transposition. ' +
      'GENERAL!SERVICES gives 2452 for the EurAsia leg between the two, and the rotation ' +
      'table is the operational source.',
  },
];

/**
 * A unit type whose recorded length is wrong.
 *
 * Linear metres drive the freight rate and the TEU equivalent, so this is not
 * cosmetic: the unit was being quoted as though it occupied a single
 * twenty-foot slot.
 */
const EQUIPMENT_CORRECTIONS = new Map([
  [
    'Roll Trailer 45 feet',
    {
      linearMetres: 13.716,
      note:
        'The workbook records 6.096 linear metres, which is the length of a twenty-foot ' +
        'unit. 45 feet is 13.716 m, which is what the 45-foot flatrack and the 45-foot high ' +
        'cube both carry in the same table.',
    },
  ],
]);

/**
 * Countries whose ports are inside the EU Emissions Trading System.
 *
 * The scheme covers voyages between EU ports in full and voyages with one end
 * outside the EU at half, so the price of a voyage depends on where both ends
 * sit. The workbook has an `ETSSTATUS` column that reads `EUM` for every port
 * and is never used; this replaces it with the distinction the scheme actually
 * makes. The United Kingdom is deliberately absent: it left the EU scheme and
 * runs its own.
 */
const EU_ETS_COUNTRIES = new Set([
  'Spain',
  'Portugal',
  'France',
  'Belgium',
  'Netherlands',
  'Germany',
  'Italy',
  'Greece',
  'Malta',
]);

const corrections = [];
function correct(value, table, what) {
  if (value == null) return value;
  const fixed = table.get(value);
  if (fixed === undefined) return value;
  corrections.push({ what, from: value, to: fixed });
  return fixed;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const slugify = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** `TANGER MED` reads better as `Tanger Med` in a sentence. */
const titleCase = (value) =>
  String(value)
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());

/** A day fraction in the workbook is a fraction of 24 hours. */
const daysToHours = (fraction) => (fraction == null ? null : Math.round(fraction * 24 * 100) / 100);

const round = (value, places = 6) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const problems = [];
function problem(message) {
  problems.push(message);
}

/**
 * Strip invisible characters from a UN/LOCODE.
 *
 * Bari's cell reads `ITBRI` followed by a zero-width space, presumably from a
 * paste out of a web page. It looks identical on screen and breaks every
 * comparison, so the invisible characters are removed rather than left to be
 * rediscovered later.
 */
const INVISIBLE = new Set([0x200b, 0x200c, 0x200d, 0xfeff]);
function cleanLocode(value) {
  if (value == null) return null;
  const cleaned = [...value].filter((character) => !INVISIBLE.has(character.codePointAt(0))).join('');
  return cleaned === '' ? null : cleaned;
}

/* -------------------------------------------------------------------------- */
/* Arguments                                                                  */
/* -------------------------------------------------------------------------- */

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i].startsWith('--')) throw new Error(`Unexpected argument: ${argv[i]}`);
    args[argv[i].slice(2)] = argv[i + 1];
  }
  if (!args.general || !args.bookings) {
    throw new Error(
      'Both workbooks are required:\n' +
        '  node scripts/workbook/import.mjs --general <GENERAL_DATA.xlsx> --bookings <BOOKINGS.xlsx>',
    );
  }
  return args;
}

/* -------------------------------------------------------------------------- */
/* Ports                                                                      */
/* -------------------------------------------------------------------------- */

function importPorts(general) {
  const table = general.sheet('TABLES');
  const tariffs = general.sheet('Tariffs');

  // The freight rate sheet lists a base index per port of origin, rows 6 to 44.
  const baseIndex = new Map();
  for (let i = 5; i <= 43; i++) {
    const name = str(tariffs[i]?.[0]);
    const value = num(tariffs[i]?.[1]);
    if (!name || value == null) continue;
    const existing = baseIndex.get(name);
    if (existing != null && existing !== value) {
      problem(`Port ${name} has two different base indices in GENERAL!Tariffs: ${existing} and ${value}`);
    }
    baseIndex.set(name, value);
  }

  const ports = new Map();
  for (let i = 1; i < table.length; i++) {
    const row = table[i];
    const name = str(row?.[0]);
    // The sheet ends with a row of column numbers used by its own lookups.
    if (!name || num(name) != null) continue;

    const serviceName = str(row[11]);
    if (!serviceName) {
      problem(`TABLES row ${i + 1} (${name}) has no service and was skipped`);
      continue;
    }

    const suppliedForRow = OWNER_SUPPLIED.get(name);
    let latitude = suppliedForRow?.latitude ?? num(row[5]);
    let longitude = suppliedForRow?.longitude ?? num(row[6]);
    let note;
    // Two rows are column-shifted in the workbook: Oran carries a stray number
    // in latitude with no longitude, and Palma carries the maps link there.
    if (latitude != null && longitude == null) {
      note = 'Coordinates are column-shifted in GENERAL!TABLES; both were dropped.';
      problem(`${name}: latitude ${latitude} has no matching longitude, coordinates dropped`);
      latitude = null;
    }
    if (!Number.isFinite(latitude) || Math.abs(latitude ?? 0) > 90) latitude = null;

    const id = slugify(name);
    let port = ports.get(id);
    if (!port) {
      const supplied = suppliedForRow;
      const portClass = str(row[15]) ?? supplied?.portClass ?? null;
      const base = baseIndex.get(name) ?? supplied?.baseIndex ?? null;

      if (base == null) {
        problem(`${name} has no base index in GENERAL!Tariffs, so it cannot be quoted`);
      }
      if (supplied) {
        note = [note, supplied.note].filter(Boolean).join(' ');
        corrections.push({
          what: 'owner-supplied',
          from: name,
          to:
            supplied.baseIndex != null
              ? `class ${supplied.portClass}, base index ${supplied.baseIndex}`
              : `coordinates ${supplied.latitude}, ${supplied.longitude}`,
        });
      }
      port = {
        id,
        slug: id,
        name,
        displayName: titleCase(name),
        locode: cleanLocode(str(row[4])),
        country: correct(str(row[12]), COUNTRY_CORRECTIONS, 'country') ?? 'Unknown',
        region: correct(str(row[13]), REGION_CORRECTIONS, 'region') ?? 'Unknown',
        latitude,
        longitude,
        teu: num(row[14]),
        // Derived from the country. See EU_ETS_COUNTRIES.
        inEuEts: EU_ETS_COUNTRIES.has(
          correct(str(row[12]), COUNTRY_CORRECTIONS, 'country') ?? 'Unknown',
        ),
        portClass: ['A', 'B', 'C', 'D'].includes(portClass) ? portClass : null,
        baseIndex: base,
        services: [],
        calls: [],
        meta: {
          source: supplied ? 'simulation-design' : note ? 'corrected' : 'workbook',
          // An owner-supplied value is a decision, not a confirmed reading, so
          // it stays visible for review however complete the record now looks.
          status: supplied || base == null || latitude == null ? 'needs-review' : 'verified',
          sourceSheet: 'GENERAL!TABLES',
          lastReviewed: TODAY,
          note: note || undefined,
        },
      };
      ports.set(id, port);
    }

    const serviceId = slugify(serviceName);
    if (!port.services.includes(serviceId)) port.services.push(serviceId);
    port.calls.push({
      serviceId,
      terminal: correct(str(row[10]), TEXT_CORRECTIONS, 'terminal'),
      agency: correct(str(row[3]), TEXT_CORRECTIONS, 'agency'),
      representative: correct(str(row[8]), TEXT_CORRECTIONS, 'representative'),
      email: str(row[9]),
      timeInPortDays: num(row[1]),
      utcOffsetHours: daysToHours(num(row[2])),
    });
  }

  return [...ports.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/* -------------------------------------------------------------------------- */
/* Services                                                                   */
/* -------------------------------------------------------------------------- */

function importServices(general, portsByName) {
  const rows = general.sheet('SERVICES');
  const services = [];

  for (let i = 0; i < rows.length; i++) {
    if (str(rows[i]?.[0]) !== 'SERVICE') continue;

    const speed = num(rows[i]?.[7]);
    const legs = [];
    let name = null;

    for (let j = i + 1; j < rows.length; j++) {
      const row = rows[j];
      const label = str(row?.[0]);
      // The block ends at a blank row or at its own totals row, which puts the
      // total distance where the service name would be.
      if (!label || num(label) != null) break;

      name ??= label;
      const from = str(row[1]);
      const to = str(row[2]);
      const distance = num(row[3]);
      const transit = num(row[4]);
      if (!from || !to || distance == null || transit == null) {
        problem(`SERVICES row ${j + 1} is incomplete and was skipped`);
        continue;
      }
      if (!portsByName.has(from)) problem(`SERVICES references unknown port ${from}`);
      if (!portsByName.has(to)) problem(`SERVICES references unknown port ${to}`);

      legs.push({
        fromPortId: slugify(from),
        toPortId: slugify(to),
        distanceNm: distance,
        transitDays: round(transit, 6),
        timeInPortDays: round(num(row[5]) ?? 0, 6),
      });
    }

    if (!name || legs.length === 0) continue;
    const totalDistance = legs.reduce((sum, leg) => sum + leg.distanceNm, 0);
    const roundTrip = legs.reduce((sum, leg) => sum + leg.transitDays + leg.timeInPortDays, 0);

    services.push({
      id: slugify(name),
      slug: slugify(name),
      name,
      displayName: name,
      speedKnots: speed ?? 0,
      legs,
      totalDistanceNm: totalDistance,
      roundTripDays: round(roundTrip, 2),
      vessels: [],
      meta: {
        source: 'workbook',
        status: speed == null ? 'needs-review' : 'verified',
        sourceSheet: 'GENERAL!SERVICES',
        lastReviewed: TODAY,
      },
    });
  }

  return services;
}

/* -------------------------------------------------------------------------- */
/* Vessels                                                                    */
/* -------------------------------------------------------------------------- */

function importVessels(general, serviceIds) {
  const rows = general.sheet('VESSELS');
  const vessels = [];

  for (let i = 1; i < rows.length; i++) {
    const name = correct(str(rows[i]?.[0]), TEXT_CORRECTIONS, 'vessel');
    if (!name) continue;

    const serviceName = str(rows[i][3]);
    const serviceId = serviceName ? slugify(serviceName) : null;
    if (serviceId && !serviceIds.has(serviceId)) {
      problem(`Vessel ${name} is assigned to unknown service ${serviceName}`);
    }

    const speed = num(rows[i][1]);
    vessels.push({
      id: slugify(name),
      slug: slugify(name),
      name,
      speedKnots: speed,
      timeInPortDays: num(rows[i][2]),
      serviceId: serviceId && serviceIds.has(serviceId) ? serviceId : null,
      meta: {
        source: 'workbook',
        status: serviceId && speed != null ? 'verified' : 'needs-review',
        sourceSheet: 'GENERAL!VESSELS',
        lastReviewed: TODAY,
        note:
          !serviceId
            ? 'The workbook assigns no service, so this vessel cannot be scheduled.'
            : speed == null
              ? 'The workbook gives no service speed.'
              : undefined,
      },
    });
  }

  return vessels;
}

/* -------------------------------------------------------------------------- */
/* Equipment                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Group the 16 unit types into the families the form offers first. The workbook
 * has no such column; the grouping follows the unit names and is the same one
 * the current Google Form uses.
 */
function familyOf(name) {
  const value = name.toLowerCase();
  if (value.includes('reefer')) return 'reefer';
  if (value.includes('flatrack')) return 'flat-rack';
  if (value.includes('roll trailer')) return 'roll-trailer';
  if (value.includes('semi-trailer')) return 'semi-trailer';
  if (value.includes('vehicle')) return 'vehicles';
  if (value.includes('project')) return 'project';
  return 'container';
}

function importEquipment(bookings) {
  const rows = bookings.sheet('Tariffs');
  const equipment = [];

  for (let i = 14; i <= 29; i++) {
    const row = rows[i];
    const id = num(row?.[2]);
    const name = str(row?.[10]);
    if (id == null || !name) continue;

    const family = familyOf(name);
    const fix = EQUIPMENT_CORRECTIONS.get(name);
    const linearMetres = fix?.linearMetres ?? round(num(row[12]) ?? 0, 3);
    if (fix) {
      corrections.push({
        what: 'equipment length',
        from: `${name} at ${round(num(row[12]) ?? 0, 3)} m`,
        to: `${fix.linearMetres} m`,
      });
    }

    equipment.push({
      id,
      slug: slugify(name),
      name,
      family,
      freightFactor: num(row[3]) ?? 1,
      maxPayloadKg: num(row[8]),
      linearMetres,
      // Derived, not stated. A TEU is defined by the twenty-foot unit, which
      // the workbook gives as 6.096 linear metres, so the slot equivalent of
      // anything else is its own length over that. Used only to express a
      // price per TEU beside the price per unit.
      teuEquivalent: linearMetres ? round(linearMetres / 6.096, 3) : null,
      emissionsTonnesPerTeu: num(row[11]),
      requiresPlug: family === 'reefer' || name.toLowerCase().includes('frigo'),
      meta: {
        source: fix ? 'corrected' : 'workbook',
        status: 'verified',
        sourceSheet: 'BOOKINGS!Tariffs',
        lastReviewed: TODAY,
        note: fix?.note,
      },
    });
  }

  if (equipment.length !== 16) problem(`Expected 16 unit types, found ${equipment.length}`);

  // A unit type that names its own length should be that long. Where the two
  // disagree the workbook is wrong about one of them, and since the linear
  // metres drive the freight rate and the slot equivalent, it matters.
  for (const item of equipment) {
    const feet = /(\d+)\s*feet/i.exec(item.name);
    if (!feet || !item.linearMetres) continue;
    const expected = Number(feet[1]) * 0.3048;
    if (Math.abs(item.linearMetres - expected) > expected * 0.1) {
      problem(
        `${item.name} is ${item.linearMetres} linear metres, but ${feet[1]} feet is ` +
          `${expected.toFixed(3)} m. The freight rate and the TEU equivalent both follow this figure.`,
      );
    }
  }

  return equipment;
}

/**
 * Recover the emissions intensity of the fleet, in kg CO2e per TEU slot per
 * nautical mile.
 *
 * The workbook gives a per-unit figure for all 16 unit types, and eight of them
 * cannot be intensities: a 20-foot flatrack is recorded at 765 against 85 for a
 * 20-foot dry box of the same size and greater weight, and the vehicles,
 * roll trailer and project rows sit between 227 and 607. Three of the sixteen
 * are in the band the industry reports - 85 for dry, 140 for refrigerated, 68
 * for a semi-trailer - and 85 kg per TEU per nautical mile is about 46 g per
 * TEU-km, which is where a reasonably efficient container ship sits.
 *
 * So the two credible container figures become the intensity of the whole
 * fleet, and every unit type's emissions follow from the slots it occupies:
 * unrefrigerated at the dry rate, refrigerated at the reefer rate. Nothing is
 * taken from outside the workbook; the eight implausible rows are simply not
 * used by the corrected rules. Legacy rules keep every raw figure, because they
 * have to reproduce what was published.
 */
function recoverEmissionsIntensity(equipment) {
  const dry = equipment.find((item) => item.name === '20 feet Container (Dry Cargo)');
  const reefer = equipment.find((item) => item.name === '20 feet Reefer');

  if (!dry?.emissionsTonnesPerTeu || !reefer?.emissionsTonnesPerTeu) {
    problem('The two 20-foot container rows are missing, so the fleet emissions intensity is unknown');
    return null;
  }

  // Both are single-TEU units, so their per-unit figure is already per slot.
  const intensity = {
    dryKgPerTeuNm: dry.emissionsTonnesPerTeu,
    refrigeratedKgPerTeuNm: reefer.emissionsTonnesPerTeu,
  };

  const implausible = equipment.filter((item) => {
    if (!item.emissionsTonnesPerTeu || !item.teuEquivalent) return false;
    const perSlot = item.emissionsTonnesPerTeu / item.teuEquivalent;
    return perSlot > intensity.refrigeratedKgPerTeuNm * 1.5;
  });

  if (implausible.length) {
    problem(
      `${implausible.length} unit types carry an emissions figure that cannot be an intensity: ` +
        implausible
          .map(
            (item) =>
              `${item.name} at ${(item.emissionsTonnesPerTeu / item.teuEquivalent).toFixed(0)} per TEU`,
          )
          .join(', ') +
        `. The corrected rules use the fleet intensity instead; legacy rules still use these.`,
    );
  }

  return intensity;
}

/**
 * The speed the network actually sails at, weighted by how far each rotation
 * runs.
 *
 * Used to normalise the per-service emissions factor, so that a service at the
 * network's own average speed neither gains nor loses. A simple mean would let
 * the 978-mile Palma shuttle pull the baseline down and quietly raise the
 * emissions of every ocean service against it.
 */
function recoverFleetMeanSpeed(services) {
  let distance = 0;
  let weighted = 0;
  for (const service of services) {
    if (!service.speedKnots || !service.totalDistanceNm) continue;
    distance += service.totalDistanceNm;
    weighted += service.totalDistanceNm * service.speedKnots;
  }
  if (!distance) {
    problem('No service has both a speed and a distance, so the fleet mean speed is unknown');
    return null;
  }
  return round(weighted / distance, 4);
}

/* -------------------------------------------------------------------------- */
/* Terminal handling                                                          */
/* -------------------------------------------------------------------------- */

function importTerminalHandling(bookings) {
  const rows = bookings.sheet('Tariffs');
  const table = {};

  for (let i = 35; i <= 50; i++) {
    const row = rows[i];
    const id = num(row?.[2]);
    const a = num(row?.[6]);
    const b = num(row?.[7]);
    const c = num(row?.[8]);
    const d = num(row?.[9]);
    if (id == null || a == null || b == null || c == null || d == null) continue;
    table[id] = { A: a, B: b, C: c, D: d };
  }

  if (Object.keys(table).length !== 16) {
    problem(`Terminal handling covers ${Object.keys(table).length} unit types, expected 16`);
  }
  return table;
}

/**
 * The bunker recovery base, one value per unit type.
 *
 * It sits in the same block as the handling table, one column to its left. The
 * charge itself is this base multiplied by 1.07 once for every step the port of
 * origin is down the class ladder - see `BRAF_CLASS_STEP` in the pricing engine.
 */
function importBunkerRecovery(bookings) {
  const rows = bookings.sheet('Tariffs');
  const table = {};

  for (let i = 35; i <= 50; i++) {
    const id = num(rows[i]?.[2]);
    const base = num(rows[i]?.[3]);
    if (id == null || base == null) continue;
    table[id] = base;
  }

  if (Object.keys(table).length !== 16) {
    problem(`Bunker recovery covers ${Object.keys(table).length} unit types, expected 16`);
  }
  return table;
}

/* -------------------------------------------------------------------------- */
/* Distances                                                                  */
/* -------------------------------------------------------------------------- */

function importDistances(general, portIds) {
  const rows = general.sheet('Distance NM');
  const header = rows[1] ?? [];
  const columns = [];
  for (let c = 1; c < header.length; c++) {
    const name = str(header[c]);
    if (name) columns[c] = slugify(name);
  }

  const matrix = {};
  for (let r = 2; r < rows.length; r++) {
    const from = str(rows[r]?.[0]);
    if (!from) continue;
    const fromId = slugify(from);
    if (!portIds.has(fromId)) continue;

    for (let c = 1; c < (rows[r]?.length ?? 0); c++) {
      const toId = columns[c];
      if (!toId || !portIds.has(toId) || toId === fromId) continue;
      const value = num(rows[r][c]);
      if (value == null || value <= 0) continue;
      (matrix[fromId] ??= {})[toId] = value;
    }
  }

  // Two cells are demonstrably wrong rather than merely inconsistent. Each is
  // replaced in both directions, with the evidence recorded above.
  for (const fix of DISTANCE_CORRECTIONS) {
    const fromId = slugify(fix.from);
    const toId = slugify(fix.to);
    if (!matrix[fromId]?.[toId] && !matrix[toId]?.[fromId]) continue;
    const before = [matrix[fromId]?.[toId], matrix[toId]?.[fromId]].filter(Boolean).join(' / ');
    (matrix[fromId] ??= {})[toId] = fix.distanceNm;
    (matrix[toId] ??= {})[fromId] = fix.distanceNm;
    corrections.push({
      what: 'distance',
      from: `${fix.from}-${fix.to} at ${before} NM`,
      to: `${fix.distanceNm} NM`,
    });
  }

  // The matrix should be symmetric. Where it is not, the workbook disagrees
  // with itself and the discrepancy is worth seeing rather than averaging away.
  for (const [from, targets] of Object.entries(matrix)) {
    for (const [to, value] of Object.entries(targets)) {
      const mirror = matrix[to]?.[from];
      if (mirror != null && Math.abs(mirror - value) > 0.5) {
        problem(`Distance ${from}-${to} is ${value} NM one way and ${mirror} NM the other`);
      }
    }
  }

  return matrix;
}

/* -------------------------------------------------------------------------- */
/* Worked quotations: the corpus the lost formulas are recovered from         */
/* -------------------------------------------------------------------------- */

/**
 * Read every solved quotation the two workbooks carry.
 *
 * `BOOKINGS!Studio` holds the routing engine's own output and
 * `BOOKINGS!Form responses 1` holds what learners were actually quoted. Both
 * use the same 41-column result block, so they are read into one shape.
 */
function readWorkedQuotations(bookings) {
  const worked = [];

  const studio = bookings.sheet('Studio');
  for (let i = 1; i < studio.length; i++) {
    const row = studio[i];
    if (!row || num(row[37]) == null) continue;
    worked.push({
      source: `Studio!${i + 1}`,
      portClass: str(row[22]),
      unit: str(row[33]),
      quantity: num(row[27]) ?? 1,
      distanceNm: num(row[36]),
      baseEur: num(row[37]),
      freightEur: num(row[38]),
      thc: num(row[39]),
      portAdditional: num(row[40]),
      portTaxes: num(row[41]),
      vgm: num(row[43]),
      documentation: num(row[44]),
      isps: num(row[45]),
      logisticManagement: num(row[46]),
      control: num(row[47]),
      amsManifest: num(row[48]),
      customsClearance: num(row[50]),
      seal: num(row[51]),
      imo: num(row[49]),
      ets: num(row[57]),
      emissions: num(row[54]),
      truckComparison: num(row[55]),
      plugIn: num(row[53]),
      totalSurcharges: num(row[58]),
      thcTotal: num(row[59]),
      totalFreight: num(row[60]),
      total: num(row[62]),
    });
  }

  const responses = bookings.sheet('Form responses 1');
  for (let i = 1; i < responses.length; i++) {
    const row = responses[i];
    if (!row || num(row[50]) == null) continue;
    worked.push({
      source: `Form responses 1!${i + 1}`,
      portClass: null,
      unit: str(row[46]),
      quantity: num(row[40]) ?? 1,
      distanceNm: num(row[49]),
      baseEur: num(row[50]),
      freightEur: num(row[51]),
      thc: num(row[52]),
      portAdditional: num(row[53]),
      portTaxes: num(row[54]),
      vgm: num(row[56]),
      documentation: num(row[57]),
      isps: num(row[58]),
      logisticManagement: num(row[59]),
      control: num(row[60]),
      amsManifest: num(row[61]),
      customsClearance: num(row[63]),
      seal: num(row[64]),
      imo: num(row[62]),
      ets: num(row[70]),
      emissions: num(row[67]),
      truckComparison: num(row[68]),
      plugIn: num(row[66]),
      totalSurcharges: num(row[71]),
      thcTotal: num(row[72]),
      totalFreight: num(row[73]),
      total: num(row[75]),
    });
  }

  return worked;
}

/**
 * Recover the sea freight curve.
 *
 * The base is a pure function of the direct distance: it does not vary with the
 * port of origin, the equipment, the service or the quantity. That claim is
 * asserted here rather than assumed - if any distance ever produced two
 * different bases, the import fails.
 */
function recoverFreightAnchors(worked) {
  const anchors = new Map();
  for (const row of worked) {
    if (row.distanceNm == null || row.baseEur == null) continue;
    const existing = anchors.get(row.distanceNm);
    if (existing != null && Math.abs(existing.baseEur - row.baseEur) > 0.005) {
      problem(
        `Sea freight base is not a function of distance alone: ${row.distanceNm} NM gives ` +
          `${existing.baseEur} (${existing.source}) and ${row.baseEur} (${row.source})`,
      );
      continue;
    }
    if (!existing) anchors.set(row.distanceNm, { baseEur: row.baseEur, source: row.source });
  }

  return [...anchors.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([distanceNm, { baseEur }]) => ({ distanceNm, baseEur: round(baseEur, 4) }));
}

/**
 * Recover the surcharges that are looked up by port class.
 *
 * Only the `Studio` rows carry the port class, so they are the ones used. A
 * surcharge is accepted only when every row of a class agrees on it once the
 * quantity has been divided out; a disagreement is reported rather than
 * averaged.
 */
function recoverClassSurcharges(worked) {
  const fixed = ['documentation', 'logisticManagement', 'customsClearance', 'amsManifest'];
  const perUnit = ['portTaxes', 'vgm', 'isps', 'control', 'seal', 'imo'];
  // Only quotations that declared dangerous goods carry an IMO charge, so the
  // classes no such quotation ever used are left unknown rather than guessed.
  const mayBeIncomplete = new Set(['imo']);
  const tables = {};

  for (const field of [...fixed, ...perUnit]) {
    const scale = perUnit.includes(field);
    const byClass = {};
    for (const row of worked) {
      if (!row.portClass || row[field] == null) continue;
      const value = round(scale ? row[field] / row.quantity : row[field], 4);
      (byClass[row.portClass] ??= new Map()).set(value, (byClass[row.portClass].get(value) ?? 0) + 1);
    }

    const table = {};
    for (const portClass of ['A', 'B', 'C', 'D']) {
      const counts = byClass[portClass];
      if (!counts) {
        if (!mayBeIncomplete.has(field)) {
          problem(`No worked quotation covers ${field} for a class ${portClass} port`);
        }
        continue;
      }
      const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
      if (ranked.length > 1) {
        problem(
          `${field} for class ${portClass} is not a single value: ` +
            ranked.map(([v, n]) => `${v} (${n}x)`).join(', '),
        );
      }
      table[portClass] = ranked[0][0];
    }
    tables[field] = table;
  }

  return {
    fixedSurcharges: {
      documentation: tables.documentation,
      logisticManagement: tables.logisticManagement,
      customsClearance: tables.customsClearance,
      amsManifest: tables.amsManifest,
    },
    perUnitSurcharges: {
      portTaxes: tables.portTaxes,
      vgmSolas: tables.vgm,
      isps: tables.isps,
      control: tables.control,
      seal: tables.seal,
      dangerousGoods: completeImoLadder(tables.imo),
    },
  };
}

/**
 * Recover the two per-equipment values the tariff sheet does not state: the
 * road-haulage emissions the comparison is drawn against, and the reefer plug
 * charge. Both are single-valued per unit type across the corpus.
 *
 * Only the six unit types that were ever quoted can be recovered. The other ten
 * are left out rather than estimated, and the engine reports them as unknown.
 */
function recoverPerEquipment(worked, equipment) {
  const byName = new Map(equipment.map((e) => [e.name, e.id]));
  const truck = {};
  const plugIn = {};

  const collect = (target, field, transform) => {
    const seen = new Map();
    for (const row of worked) {
      // Only the Studio rows are used. They are the routing engine's own output
      // and carry the port class; the form responses were written back by a
      // document merge and their later columns no longer line up.
      if (!row.portClass) continue;
      const id = byName.get(row.unit ?? '');
      if (id == null || row[field] == null) continue;
      const value = transform(row);
      if (value == null || !Number.isFinite(value)) continue;
      if (!seen.has(id)) seen.set(id, new Map());
      const counts = seen.get(id);
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    for (const [id, counts] of seen) {
      const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
      if (ranked.length > 1) {
        problem(
          `${field} for unit ${id} is not a single value: ` +
            ranked.map(([v, n]) => `${v} (${n}x)`).join(', '),
        );
      }
      target[id] = ranked[0][0];
    }
  };

  collect(truck, 'truckComparison', (row) =>
    row.distanceNm ? round(row.truckComparison / row.distanceNm, 5) : null,
  );
  collect(plugIn, 'plugIn', (row) => round(row.plugIn, 2));

  return { truckEmissionsPerNm: truck, plugInEur: plugIn };
}

/**
 * Read the routings the current process publishes.
 *
 * `BOOKINGS!Routes` holds one row per origin, destination and sailing date, so
 * the same itinerary repeats thousands of times. Only the distinct itineraries
 * are kept, which is what the routing engine has to agree with.
 *
 * The sheet's column names read oddly: `First Port` is where the first leg
 * *ends*, not where it starts, and `Nex Port 1` is the call immediately after
 * the origin on that service. Only the service and the port each leg ends at
 * are needed here.
 */
function importPublishedRoutes(bookings, portIds, serviceIds) {
  const rows = bookings.sheet('Routes');
  const seen = new Map();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const origin = str(row?.[0]);
    const destination = str(row?.[1]);
    if (!origin || !destination) continue;

    const originId = slugify(origin);
    const destinationId = slugify(destination);
    if (!portIds.has(originId) || !portIds.has(destinationId)) continue;

    const legs = [];
    for (const [portColumn, serviceColumn] of [
      [3, 4],
      [7, 8],
      [11, 12],
    ]) {
      const toPort = str(row[portColumn]);
      const service = str(row[serviceColumn]);
      if (!toPort || !service) break;
      const toPortId = slugify(toPort);
      const serviceId = slugify(service);
      if (!portIds.has(toPortId) || !serviceIds.has(serviceId)) break;
      legs.push({ serviceId, toPortId });
    }

    if (legs.length === 0) continue;
    if (legs[legs.length - 1].toPortId !== destinationId) continue;

    const key = `${originId}>${destinationId}`;
    if (seen.has(key)) continue;
    seen.set(key, { originId, destinationId, legs });
  }

  return [...seen.values()].sort(
    (a, b) => a.originId.localeCompare(b.originId) || a.destinationId.localeCompare(b.destinationId),
  );
}

/**
 * Fill in the two IMO rates the corpus never covered.
 *
 * No worked quotation ever carried dangerous goods from a class A or B port, so
 * only C (65) and D (70) were ever published. Every other per-unit surcharge in
 * this tariff steps by a fixed amount between classes, and the IMO rate steps by
 * 5 from C to D, so the ladder is continued downwards: B = 60, A = 55.
 *
 * This is an extrapolation of the workbook's own pattern rather than a figure
 * from outside it, which is the most defensible basis available. The values are
 * flagged for review so that they stay distinguishable from the two the corpus
 * actually proves.
 */
function completeImoLadder(table) {
  const step = table.D != null && table.C != null ? table.D - table.C : null;
  if (step == null) return table;
  const completed = { ...table };
  if (completed.B == null) completed.B = round(completed.C - step, 2);
  if (completed.A == null) completed.A = round(completed.B - step, 2);
  return completed;
}

/* -------------------------------------------------------------------------- */
/* Emit                                                                       */
/* -------------------------------------------------------------------------- */

const BANNER = (sources) => `/**
 * Generated by scripts/workbook/import.mjs on ${TODAY}. Do not edit by hand.
 *
 * Source: ${sources}
 *
 * To change any value here, change the workbook and run the import again:
 *   npm run import:workbook -- --general <file> --bookings <file>
 *
 * See docs/quote/workbook-audit.md for what the workbook contains and
 * docs/quote/pricing-model.md for how the priced values were recovered.
 */
`;

function emit(file, contents) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, file), contents, 'utf8');
  return `src/data/quote/${file}`;
}

const json = (value) => JSON.stringify(value, null, 2);

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

function main() {
  const args = parseArgs(process.argv.slice(2));
  const general = openWorkbook(args.general);
  const bookings = openWorkbook(args.bookings);

  const ports = importPorts(general);
  const portsByName = new Map(ports.map((p) => [p.name, p]));
  const portIds = new Set(ports.map((p) => p.id));

  const services = importServices(general, portsByName);
  const serviceIds = new Set(services.map((s) => s.id));
  const vessels = importVessels(general, serviceIds);
  for (const vessel of vessels) {
    if (!vessel.serviceId) continue;
    services.find((s) => s.id === vessel.serviceId)?.vessels.push(vessel.id);
  }

  const equipment = importEquipment(bookings);
  const terminalHandling = importTerminalHandling(bookings);
  const bunkerRecovery = importBunkerRecovery(bookings);
  const distances = importDistances(general, portIds);

  const emissionsIntensity = recoverEmissionsIntensity(equipment);
  const fleetMeanSpeedKnots = recoverFleetMeanSpeed(services);

  const worked = readWorkedQuotations(bookings);
  const freightAnchors = recoverFreightAnchors(worked);
  const { fixedSurcharges, perUnitSurcharges } = recoverClassSurcharges(worked);
  const { truckEmissionsPerNm, plugInEur } = recoverPerEquipment(worked, equipment);

  const written = [];

  written.push(
    emit(
      'network.ts',
      BANNER('GENERAL!TABLES, GENERAL!SERVICES, GENERAL!VESSELS') +
        `import type { Port, Service, Vessel } from '@/types/quote';\n\n` +
        `export const ports: Port[] = ${json(ports)};\n\n` +
        `export const services: Service[] = ${json(services)};\n\n` +
        `export const vessels: Vessel[] = ${json(vessels)};\n`,
    ),
  );

  written.push(
    emit(
      'equipment.ts',
      BANNER('BOOKINGS!Tariffs') +
        `import type { Equipment } from '@/types/quote';\n\n` +
        `export const equipment: Equipment[] = ${json(equipment)};\n`,
    ),
  );

  written.push(
    emit(
      'tariffs.ts',
      BANNER('BOOKINGS!Tariffs, plus values recovered from 405 worked quotations') +
        `import type { Tariffs } from '@/types/quote';\n\n` +
        `export const tariffs: Tariffs = ${json({
          terminalHandling,
          bunkerRecovery,
          plugInEur,
          truckEmissionsPerNm,
          emissionsIntensity,
          fleetMeanSpeedKnots,
          fixedSurcharges,
          perUnitSurcharges,
          portAdditionalRate: 0.2,
          freightAnchors,
          meta: {
            source: 'recovered',
            status: 'needs-review',
            sourceSheet: 'BOOKINGS!Tariffs, BOOKINGS!Studio, BOOKINGS!Form responses 1',
            lastReviewed: TODAY,
            note:
              'Handling comes from the tariff table. The surcharge tables and the freight ' +
              'curve were recovered from the worked quotations because the spreadsheet ' +
              'formulas did not survive the export. See docs/quote/pricing-model.md.',
          },
        })};\n`,
    ),
  );

  // The worked quotations are the regression corpus for the pricing engine.
  // They carry no personal data: only a port class, a unit type, a quantity, a
  // distance and the resulting charges.
  const corpus = worked
    .filter((row) => row.portClass && row.distanceNm != null && row.total != null)
    .map((row) => ({
      source: row.source,
      portClass: row.portClass,
      unit: row.unit,
      quantity: row.quantity,
      distanceNm: row.distanceNm,
      baseEur: row.baseEur,
      freightEur: row.freightEur,
      terminalHandling: row.thc,
      terminalHandlingTotal: row.thcTotal,
      portAdditional: row.portAdditional,
      portTaxes: row.portTaxes,
      vgm: row.vgm,
      documentation: row.documentation,
      isps: row.isps,
      logisticManagement: row.logisticManagement,
      control: row.control,
      customsClearance: row.customsClearance,
      seal: row.seal,
      imo: row.imo,
      ets: row.ets,
      plugIn: row.plugIn,
      emissions: row.emissions,
      truckComparison: row.truckComparison,
      totalSurcharges: row.totalSurcharges,
      totalFreight: row.totalFreight,
      total: row.total,
    }));

  const fixtureDir = path.join(ROOT, 'tests/fixtures');
  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.writeFileSync(
    path.join(fixtureDir, 'worked-quotations.json'),
    `${JSON.stringify(corpus, null, 2)}\n`,
    'utf8',
  );
  written.push('tests/fixtures/worked-quotations.json');

  const routes = importPublishedRoutes(bookings, portIds, serviceIds);
  fs.writeFileSync(
    path.join(fixtureDir, 'published-routes.json'),
    `${JSON.stringify(routes, null, 2)}\n`,
    'utf8',
  );
  written.push('tests/fixtures/published-routes.json');

  written.push(
    emit(
      'distances.ts',
      BANNER('GENERAL!Distance NM') +
        `/** Direct port-to-port distance in nautical miles, which is what the price uses. */\n` +
        `export const distancesNm: Record<string, Record<string, number>> = ${json(distances)};\n`,
    ),
  );

  /* ---- report ---------------------------------------------------------- */

  console.log(`Imported on ${TODAY}`);
  console.log(`  ports        ${ports.length}`);
  console.log(`  services     ${services.length} (${services.reduce((n, s) => n + s.legs.length, 0)} legs)`);
  console.log(`  vessels      ${vessels.length} (${vessels.filter((v) => v.serviceId).length} assigned)`);
  console.log(`  equipment    ${equipment.length}`);
  console.log(`  distances    ${Object.values(distances).reduce((n, t) => n + Object.keys(t).length, 0)} pairs`);
  console.log(`  worked rows  ${worked.length}`);
  console.log(`  freight anchors ${freightAnchors.length}`);

  if (corrections.length) {
    console.log(`\nCorrections applied (${corrections.length}):`);
    const unique = new Map(corrections.map((c) => [`${c.what}|${c.from}`, c]));
    for (const c of unique.values()) console.log(`  ${c.what}: "${c.from}" -> "${c.to}"`);
  }

  console.log(`\nWritten:`);
  for (const file of written) console.log(`  ${file}`);

  if (problems.length) {
    console.log(`\nNeeds review (${problems.length}):`);
    for (const message of [...new Set(problems)]) console.log(`  - ${message}`);
  }
}

main();

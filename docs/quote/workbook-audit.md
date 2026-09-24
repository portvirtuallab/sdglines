# Excel workbook audit

Audit date: 2026-09-22.
Auditor: build team, ahead of the `/request-a-quote` implementation.

Two workbooks were supplied as the operational source of truth for the SDG Lines
quotation tool. Neither is read at runtime: both are converted into structured
TypeScript by a documented import step. This file records what is actually in
them, what the website must take from them, and what cannot be trusted yet.

## A. Files

| Ref | File | Sheets | Role |
| --- | --- | --- | --- |
| `GENERAL` | `SDGLINESV2(GENERAL_DATA).xlsx` | 65 | Network configuration: ports, services, vessels, distances, freight tariffs |
| `BOOKINGS` | `SDG Lines - Bookings_V3_FORM (Responses).xlsx` | 11 | The live Google Form quotation process: field list, routing engine output, surcharge tables, 1382 historical quotations |

## B. Sheets that matter to the quotation tool

### `GENERAL!TABLES` — port master (41 rows)

One row per **port and service**, not per port. Barcelona appears three times
(EurAsia, Optimed, Gimnesias) with a different terminal and time in port each.

Columns: `PORT`, `TIME IN PORT` (day fraction), `UTC winter` (day fraction),
`Shipping Agent`, `Locode`, `Latitude`, `Longitude`, `linkmaps`,
`Owners Representative`, `Mail`, `Terminal`, `Service`, `Country`, `Region`,
`TEU`, `CLASS` (A-D), `ETSSTATUS`, then eight empty surcharge columns
(`CAF`, `BAF`, `BC`, `CS`, `B/L`, `T3`, `WRS`, `WS`).

`CLASS` is the key the terminal handling tariff is looked up by. `ETSSTATUS` is
`EUM` for every port, i.e. every call is currently treated as an EU voyage for
the emissions trading surcharge.

### `GENERAL!SERVICES` — service rotations (5 blocks, 57 legs)

Five rotations, each a block of consecutive legs with `SERVICE`, `ORIGIN`,
`DESTINATION`, `NM`, `TT` (days), `Time in Port`, and a per-service design speed
in the block header:

| Service | Legs | Total NM | Round trip |
| --- | --- | --- | --- |
| Westmed | 8 | 3 994 | 14.30 days at 18.13 kn |
| Eastmed | 11 | 5 400 | 15.34 days at 17.93 kn |
| Optimed | 14 | 6 610 | 21.00 days at 16.86 kn |
| EurAsia | 18 | 24 998 | 62.10 days at 18.09 kn |
| Gimnesias | 6 | 978 | Barcelona-Palma shuttle at 10.19 kn |

`BOOKINGS!BoundTable` restates the same legs keyed `SERVICE+ORIGIN`, which is
how the form resolves the next port. The two agree leg for leg.

### `GENERAL!VESSELS` — 18 vessels

Name, service speed (knots), time in port (day fraction), service. Four vessels
have no service assigned (`Elsa Morante`, `Maria Veleda`, `Fatema Mernissi`,
`Maimouna Helene Uld Hamidou`) and `Frances Allen` has no speed or time in port.
Per-vessel sheets in `GENERAL` hold the sailing rotations.

### `BOOKINGS!Tariffs` — equipment, handling and surcharges

The pricing tables, laid out as three unlabelled blocks:

- **Equipment catalogue (16 types)**, with per-type TEU factor, length and width
  in cm, maximum payload (kg), emissions (tn/TEU) and linear metres:
  20' dry, 40' dry, 20' reefer, 40' reefer, 45' HC, 20' open top, semi-trailer,
  semi-trailer frigo, flatrack 20/40/45HC, roll trailer 40/45/60, vehicles,
  project cargo.
- **Terminal handling by equipment and port class** (A/B/C/D). A 20' reefer is
  260 / 280 / 304 / 330 EUR.
- **Port TEU and class table** (33 ports), duplicating `GENERAL!TABLES`.

A short block of loose values (25, 55, 15, 10, 11, 20, 30, 55, 35) holds the
fixed surcharges - documentation, ISPS, seal and so on - but their labels live
only in the Google Sheets formulas, which did not survive the export (see D).

### `GENERAL!Tariffs` — sea freight rate table

A rate per port of origin and equipment type, derived from two published Drewry
World Container Index lanes (Shanghai-Genoa, Shanghai-Rotterdam) converted at
EUR/USD 0.87335, plus a 25 % "opening expenses" uplift.

The table reduces to one formula, which reproduces every published coefficient:

```
coefficient(port, equipment) = PRICE_ML * linearMetres(equipment)
                             * equipmentRate(equipment) / 100
                             * portBase(port) / 100
```

with `PRICE_ML = 0.004700130378`, `portBase` from 85 (Yantian) to 130 (Rades,
Nouakchott, Oran, Misurata), and `equipmentRate` 100 for a 20' dry up to 300 for
project cargo. Verified against all 39 port rows.

### `BOOKINGS!Form responses 1` — the quotation contract (82 columns)

Columns 0-33 are what the learner submits; 35-75 are what the engine returns.
This is the field list the new tool must reproduce:

**Input** - email, name, company, department, position, city, country code and
phone, port of origin, port of destination, desired departure date, dangerous
goods (plus IMO class and description), type of service, container type, ST, FR,
RT, vehicle brand/model and length/width/height, other requirements, number of
units, VGM SOLAS, shipment length/width/height/weight, project cargo, terms
acceptance, Port Virtual PIN.

**Output** - first route, service, valid from, valid to, quotation number,
quantity, ETD, ETA, transit time, vessel, route string, unit type, LM,
distance km, sea freight base FEU EUR, freight, THC, port additional, port taxes,
BRAF, VGM, documentation, ISPS, logistic management, control, AMS manifest, IMO,
customs clearance, seal, total weight, plug-in, emissions (kg CO2eq), truck
comparison, CO2 saved, ETS, total surcharges, THC total, total freight, F+B,
total quotation.

### `BOOKINGS!Studio` and `BOOKINGS!Routes` — 21 110 worked quotations

Every row is a solved quotation: origin, destination, requested date, up to
**three legs** with port, service and vessel per leg, local ETD/ETA per leg,
transit time, port class, and the full cost breakdown. Multi-leg quotations are
normal: `BARI -> BARCELONA -> MUMBAI` transships from Eastmed to EurAsia.

This is the single most valuable asset in the two files: it is a 21 110-case
regression corpus for the routing and pricing engines.

## C. Verified relationships

```
Service  --< ServiceLeg (origin, destination, NM, TT, time in port)
Port     --< PortService (terminal, agent, time in port, UTC offset) --> Service
Port      -> class (A-D) --> THC(equipment, class)
Port      -> base index (85-130) --> freight coefficient(equipment)
Vessel    -> Service, speed, time in port
Equipment -> TEU, LM, dimensions, payload, emissions factor, rate
Quotation -> 1..3 legs --> service and vessel per leg
```

Confirmed against the worked rows: THC is `f(equipment, portClass) * quantity`;
freight is `seaFreightBase * 1.25` (the 25 % opening expenses); port additional
scales with the number of legs.

## D. Problems found

| # | Finding | Impact | Proposed handling |
| --- | --- | --- | --- |
| 1 | The Google Sheets formulas were exported as `__xludf.DUMMYFUNCTION("COMPUTED_VALUE")`. Only cached results survive. | The exact arithmetic for the surcharges, distance and emissions is not recoverable by reading the file. | Reconstruct from the tariff tables and validate against the 21 110 worked rows; anything that cannot be reproduced is raised rather than invented. |
| 2 | Shared strings are corrupted by a bad find-and-replace: `Ahmed` reads `AImed`, `Mahmoud` reads `MAImoud`, `Jawaharlal` reads `JawAIarlal`, `Aglaonike` reads `AglAIonike`. | Agent names and one vessel name are wrong wherever they appear. | Corrected on import, listed explicitly so the fix is auditable. |
| 3 | `TABLES` rows for `ORAN` and `PALMA` are column-shifted: Oran has `271` in latitude and no longitude; Palma has the maps link in the latitude cell. | Two ports cannot be placed on a map. | Import marks them `needs-review`; the map omits them until corrected. |
| 4 | `PALMA` is missing from `GENERAL!Tariffs` and from the port class table, although Gimnesias calls there and the worked rows quote it. | No freight coefficient and no port class for a served port. | `needs-review`; quoting Palma is blocked until a base index and class are supplied. |
| 5 | `ORAN`'s country reads `Algiers` (a city) and its agent `Sailportlogistics.com ALGIERSia` - the string `Algeria` was overwritten. | Wrong country in the directory. | Corrected on import with a note. |
| 6 | Four vessels have no service and one has no speed. | They cannot be scheduled. | Excluded from the quotation engine, kept in the fleet data as unassigned. |
| 7 | `GENERAL!TABLES` surcharge columns (`CAF`, `BAF`, `BC`, `CS`, `B/L`, `T3`, `WRS`, `WS`) are entirely empty. | Per-port surcharges cannot be derived from this sheet. | Values taken from the `BOOKINGS!Tariffs` fixed block instead. |
| 8 | `BOOKINGS!Verification` holds 34 four-digit Port Virtual PIN codes in clear. | These are access credentials, and the repository is public. | **Never committed.** See `docs/quote/pin-validation.md`. |
| 9 | The existing site's 36 ports were built from the legacy website, not from this workbook; naming and coverage differ. | Two competing port lists. | The workbook wins for every operational field, per the source precedence rule. |
| 10 | `Distance KM` in the worked rows does not match the sum of the rotation legs. | The distance behind the freight figure is not yet explained. | Open: reconciled against the `Distance NM` matrices before the pricing engine is trusted. |

## E. What the workbook does not contain

No published sailing schedule (departure days per week), no prices or class for
Palma, no per-port surcharge values, and no dangerous-goods acceptance matrix.
None of these will be invented. Where the tool needs them it asks, or it says
that it does not know.

import type { Service } from '@/types/content';

/**
 * The five SDG Lines services.
 *
 * Audit finding (2026-09-18): the legacy service pages for Eastmed, EurAsia,
 * Optimed and Westmed publish a symbolic photograph and one generic paragraph.
 * None of them publishes a port rotation, a frequency or a transit time. The
 * Gimnesias page is the single exception: it states that the service connects
 * Barcelona and Palma de Mallorca.
 *
 * A route page with no rotation is useless during a training exercise, and
 * inventing a schedule would breach the rule against presenting unverified
 * values as fact. The resolution used here:
 *
 *   - Each rotation is a PROPOSAL derived from the published ports of call and
 *     their geography. It is marked `needs-review` and every route page renders
 *     a notice saying the rotation awaits confirmation.
 *   - `frequency` and `transitDaysFromOrigin` are left undefined throughout,
 *     because neither can be derived from anything the legacy site publishes.
 *     The interface shows "To be confirmed" rather than a plausible number.
 *
 * Vessel deployments are NOT proposals. They are taken verbatim from the legacy
 * fleet table, which does state the service each vessel is assigned to.
 */

const AUDIT_DATE = '2026-09-18';

/** Turn an ordered list of port ids into rotation calls. */
function rotationOf(portIds: string[]) {
  return portIds.map((portId, index) => ({
    portId,
    order: index + 1,
    // Transit times are deliberately absent. See the note above.
    transitDaysFromOrigin: undefined,
  }));
}

export const services: Service[] = [
  {
    id: 'westmed',
    slug: 'westmed',
    name: 'Westmed',
    code: 'WMED',
    coverage: 'Western Mediterranean, Maghreb and the Atlantic extension',
    summary:
      'Connects the Spanish and French Mediterranean coasts with the Maghreb, and continues through the Strait of Gibraltar to the Canary Islands and West Africa.',
    description: [
      'Westmed is the short sea backbone of the SDG Lines network in the western basin. It links the industrial regions behind Barcelona, Valencia, Marseille and Genoa with the North African markets of Morocco, Algeria and the Atlantic coast.',
      'The service is designed around Motorways of the Sea traffic: accompanied and unaccompanied road trailers move on the same call as containerised cargo, which lets a simulated shipper compare a road leg with a sea leg on the same relation.',
      'Tanger Med acts as the pivot of the rotation. Cargo for the Atlantic extension to Las Palmas and Nouakchott transfers there, which makes the service a useful case for teaching transhipment and through bills of lading.',
    ],
    rotation: rotationOf([
      'barcelona',
      'valencia',
      'tanger-med',
      'casablanca',
      'las-palmas',
      'nouakchott',
      'oran',
      'algiers',
      'marseille',
      'genoa',
    ]),
    frequency: undefined,
    vesselIds: ['frances-allen', 'nawal-el-saadawi'],
    capabilities: [
      'containers',
      'roro',
      'reefer',
      'dangerous-goods',
      'motorways-of-the-sea',
      'project-cargo',
    ],
    mapColor: '#00b8d8',
    meta: {
      source: 'simulation-design',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'Rotation proposed from the published ports of call. The legacy Westmed page contains no rotation, frequency or transit time. Vessel deployment taken from the legacy fleet table.',
    },
  },
  {
    id: 'eastmed',
    slug: 'eastmed',
    name: 'Eastmed',
    code: 'EMED',
    coverage: 'Western Mediterranean to the Aegean, Levant and Nile delta',
    summary:
      'Links Barcelona and the Tyrrhenian ports with Greece, Türkiye, Lebanon and Egypt, ending at the Mediterranean entrance to the Suez Canal.',
    description: [
      'Eastmed carries containerised and rolling cargo from the western basin to the eastern Mediterranean. It is the service most often used in training exercises that involve a longer sea leg and more than one customs territory.',
      'The rotation reaches Port Said and Damietta, which places it alongside the EurAsia service at the Suez gateway. Cargo can therefore be routed either as a direct Eastmed call or as a transfer onto EurAsia for destinations beyond Suez.',
      'Reefer and dangerous goods traffic are both accepted, which makes the service suitable for exercises on cold chain documentation and IMDG declarations.',
    ],
    rotation: rotationOf([
      'barcelona',
      'genoa',
      'civitavecchia',
      'piraeus',
      'izmir',
      'beirut',
      'port-said',
      'damietta',
    ]),
    frequency: undefined,
    vesselIds: ['merce-rodoreda', 'sappho'],
    capabilities: ['containers', 'roro', 'reefer', 'dangerous-goods', 'express-transit'],
    mapColor: '#2e6be6',
    meta: {
      source: 'simulation-design',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'Rotation proposed from the published ports of call. The legacy Eastmed page contains no rotation, frequency or transit time. Vessel deployment taken from the legacy fleet table.',
    },
  },
  {
    id: 'optimed',
    slug: 'optimed',
    name: 'Optimed',
    code: 'OPTI',
    coverage: 'Central Mediterranean, Adriatic and Libya',
    summary:
      'A pure car and truck carrier service linking Barcelona with Sicily, Malta, the Adriatic and the North African coast.',
    description: [
      'Optimed is operated with pure car and truck carriers rather than container vessels. It is the service to use in exercises about vehicle logistics, high and heavy cargo and ramp operations.',
      'The rotation covers the Adriatic ports of Bari, Durrës and Bar together with Valletta, Radès and Misurata, which gives the simulation a realistic mix of European Union and non European Union calls within one voyage.',
      'Because the vessels are ramp loaded, the service does not accept standard containerised cargo on the same terms as the container services. Learners comparing options across services will see that difference reflected in the equipment available on a quotation.',
    ],
    rotation: rotationOf([
      'barcelona',
      'palermo',
      'valletta',
      'bari',
      'durres',
      'bar',
      'misurata',
      'rades-la-goulette',
    ]),
    frequency: undefined,
    vesselIds: ['aglaonike', 'hagnodice', 'theano-of-crotone'],
    capabilities: ['roro', 'project-cargo'],
    mapColor: '#40a838',
    meta: {
      source: 'simulation-design',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'Rotation proposed from the published ports of call. The legacy Optimed page contains no rotation, frequency or transit time. Vessel deployment taken from the legacy fleet table, which assigns the three PCTC vessels to this service.',
    },
  },
  {
    id: 'eurasia',
    slug: 'eurasia',
    name: 'EurAsia',
    code: 'EURA',
    coverage: 'North Europe and Iberia to the Gulf, India and the Far East',
    summary:
      'The long haul service of the network, running from the North Sea through Suez to the Arabian Gulf, India and Korea.',
    description: [
      'EurAsia is the deep sea service of SDG Lines. It begins in the North Sea range, calls in Iberia and the western Mediterranean, transits Suez and continues through the Red Sea and the Indian Ocean to the Far East.',
      'Six of the fourteen vessels in the fleet are deployed here, which makes it the largest single deployment in the network. The rotation is long enough that exercises can meaningfully compare a direct call against transhipment at Salalah or Tanger Med.',
      'Because the service crosses several customs and regulatory regimes, it is the natural choice for exercises on documentation, incoterms and dangerous goods declarations over long distances.',
    ],
    rotation: rotationOf([
      'rotterdam',
      'antwerp',
      'hamburg',
      'felixstowe',
      'le-havre',
      'lisbon',
      'valencia',
      'barcelona',
      'port-said',
      'aqaba',
      'jeddah',
      'salalah',
      'mumbai',
      'abu-dhabi',
      'busan',
    ]),
    frequency: undefined,
    vesselIds: [
      'caroline-herschel',
      'gerty-cori',
      'dorothy-hodgkin',
      'maria-goeppert-mayer',
      'rita-levi-montalcini',
      'halide-edib-adivar',
    ],
    capabilities: [
      'containers',
      'roro',
      'reefer',
      'dangerous-goods',
      'project-cargo',
      'express-transit',
    ],
    mapColor: '#8b5cf6',
    meta: {
      source: 'simulation-design',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'Rotation proposed from the published ports of call. The legacy EurAsia page contains no rotation, frequency or transit time. Vessel deployment taken from the legacy fleet table.',
    },
  },
  {
    id: 'gimnesias',
    slug: 'gimnesias',
    name: 'Gimnesias',
    code: 'GIMN',
    coverage: 'Barcelona to the Balearic Islands',
    summary:
      'A short island shuttle between Barcelona and Palma de Mallorca, and the shortest rotation in the network.',
    description: [
      'Gimnesias connects the mainland at Barcelona with Palma de Mallorca. It is the only SDG Lines service whose rotation is stated on the legacy website, and the only one short enough to complete inside a single training session.',
      'The short distance makes it the best starting point for a first simulation exercise. A learner can follow a shipment from booking through to arrival without the transit times of a deep sea service getting in the way.',
      'The service name comes from the Gymnesian Islands, the classical name for Mallorca and Menorca.',
    ],
    rotation: rotationOf(['barcelona', 'palma-de-mallorca']),
    frequency: undefined,
    vesselIds: [],
    capabilities: ['containers', 'roro', 'reefer', 'motorways-of-the-sea'],
    mapColor: '#f2a22e',
    meta: {
      source: 'legacy-site',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'The Barcelona to Palma de Mallorca rotation is confirmed by the legacy Gimnesias page. No vessel is assigned to this service in the legacy fleet table, so the service currently has no published tonnage. Product owner to assign a vessel or confirm that the service is operated by a partner.',
    },
  },
  /* ---------------------------------------------------------------- *
   * The American network, November 2026.
   *
   * Transit days are computed from the leg distances at 18 knots with
   * twelve hours a call. They are not estimates: americas/cycles.js in
   * the quotation repository derives them from the same legs the
   * quotation engine prices, so the timetable here and the transit time
   * on a quotation cannot disagree.
   * ---------------------------------------------------------------- */
  {
    id: 'am-atl',
    slug: 'am-atl',
    name: 'Atlantic Americas',
    code: 'AM-ATL',
    coverage: 'Caribbean to the North American Atlantic coast',
    summary:
      'Links Cartagena de Indias with New York and Halifax, carrying coffee and agricultural exports north and manufactured goods south.',
    description: [
      'Atlantic Americas is the shorter of the two Atlantic rotations and the one that feeds the Intercoastal service. Cartagena is the pivot: cargo arriving from the Pacific through the canal transfers here for New York and Halifax.',
      'The rotation runs in one direction only, as a feeder loop does. Cartagena to New York is 1,980 nautical miles. Halifax back to New York means completing the loop through Cartagena, which is 4,400. A quotation shows that honestly rather than pretending the two are the same distance.',
      'Two vessels hold a weekly departure from every port. The round trip is 5,000 nautical miles and takes 13.07 days including port time.',
    ],
    rotation: [
      { portId: 'cartagena-de-indias', order: 1, transitDaysFromOrigin: 0 },
      { portId: 'new-york-new-jersey', order: 2, transitDaysFromOrigin: 4.58 },
      { portId: 'halifax', order: 3, transitDaysFromOrigin: 6.47 },
    ],
    frequency: 'Weekly',
    vesselIds: ['am-atl-01', 'am-atl-02'],
    capabilities: ['containers', 'reefer', 'dangerous-goods'],
    mapColor: '#2f6f4e',
    meta: {
      source: 'simulation-design',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'Rotation proposed in the November 2026 brief. The distances, transit times and two-vessel deployment are computed rather than proposed: the brief suggested three vessels, which puts departures 4.36 days apart and cannot be published as a weekly timetable. Service name and animal identity await approval.',
    },
  },
  {
    id: 'am-pac',
    slug: 'am-pac',
    name: 'Pacific Americas',
    code: 'AM-PAC',
    coverage: 'United States and Canada on the Pacific coast',
    summary:
      'A short shuttle between Los Angeles and Vancouver for containerised general cargo, machinery, forest products and refrigerated cargo.',
    description: [
      'Pacific Americas is the shortest service on the network: 1,150 nautical miles each way, a round trip of 6.32 days including both calls.',
      'It meets the rest of the network at Los Angeles and Vancouver, both of which the Intercoastal service also calls at, so cargo from the Atlantic coast reaches either port without a second vessel change.',
      'One vessel holds a weekly departure from both ports. The brief proposed two, which would put departures 3.16 days apart: neither weekly nor twice weekly, and not a pattern that can be published.',
    ],
    rotation: [
      { portId: 'los-angeles', order: 1, transitDaysFromOrigin: 0 },
      { portId: 'vancouver', order: 2, transitDaysFromOrigin: 2.66 },
    ],
    frequency: 'Weekly',
    vesselIds: ['am-pac-01'],
    capabilities: ['containers', 'reefer', 'dangerous-goods'],
    mapColor: '#b8860b',
    meta: {
      source: 'simulation-design',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'Rotation proposed in the November 2026 brief. One vessel is what a weekly service needs; the brief proposed two. Service name and animal identity await approval.',
    },
  },
  {
    id: 'am-int',
    slug: 'am-int',
    name: 'Intercoastal Americas',
    code: 'AM-INT',
    coverage: 'North American Atlantic and Pacific coasts through the Panama Canal',
    summary:
      'The long rotation: New York to Cartagena, through the Panama Canal to Los Angeles and Vancouver, and home the same way.',
    description: [
      'Intercoastal Americas is the backbone of the American network and the reason the other two services reach each other. The round trip is 12,708 nautical miles and 33.42 days, of which two days are canal passage and waiting.',
      'The Panama Canal is a transit, not a call. A vessel works no cargo there, so it is not a port in the simulation and cannot be quoted to or from. Its passage and waiting time are carried on the legs that enter and leave it, which is where they belong.',
      'Los Angeles is called twice, outbound and homebound, and works cargo on both occasions. That is what lets a shipment from Vancouver reach New York on a single vessel.',
      'Five vessels hold a weekly departure. This is the one service where the proposed deployment and the computed cycle agree.',
    ],
    rotation: [
      { portId: 'new-york-new-jersey', order: 1, transitDaysFromOrigin: 0 },
      { portId: 'cartagena-de-indias', order: 2, transitDaysFromOrigin: 4.58 },
      { portId: 'los-angeles', order: 3, transitDaysFromOrigin: 13.05 },
      { portId: 'vancouver', order: 4, transitDaysFromOrigin: 16.21 },
    ],
    frequency: 'Weekly',
    vesselIds: ['am-int-01', 'am-int-02', 'am-int-03', 'am-int-04', 'am-int-05'],
    capabilities: ['containers', 'reefer', 'dangerous-goods'],
    mapColor: '#7b4397',
    meta: {
      source: 'simulation-design',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'Rotation proposed in the November 2026 brief and confirmed at five vessels by the cycle calculation. The rotation above lists the first call at each port; Los Angeles and Cartagena are called again homebound. Service name and animal identity await approval.',
    },
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((service) => service.id === id);
}

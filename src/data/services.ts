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
    mapColor: '#C8102E',
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
    mapColor: '#0B5FA5',
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
    mapColor: '#0F8A7E',
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
    mapColor: '#5B3FA8',
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
    mapColor: '#D97706',
    meta: {
      source: 'legacy-site',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'The Barcelona to Palma de Mallorca rotation is confirmed by the legacy Gimnesias page. No vessel is assigned to this service in the legacy fleet table, so the service currently has no published tonnage. Product owner to assign a vessel or confirm that the service is operated by a partner.',
    },
  },
];

export function getServiceById(id: string): Service | undefined {
  return services.find((service) => service.id === id);
}

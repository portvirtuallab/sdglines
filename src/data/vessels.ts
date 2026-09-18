import type { Vessel } from '@/types/content';

/**
 * The SDG Lines fleet.
 *
 * Identity data (vessel type, class, IMO, MMSI, call sign, year launched and
 * service assignment) is taken verbatim from the fleet table published on
 * sdglines.com and audited on 2026-09-18. Those values are part of the
 * simulation design, so they are marked `inherited` until the product owner
 * confirms them.
 *
 * Technical particulars (length, capacity, speed) are NOT published on the
 * legacy site. They are deliberately left absent rather than estimated: the
 * vessel pages render a review notice where a particular is missing, which is
 * honest and also tells the product owner exactly what to supply.
 *
 * The namesake biographies are written for this site from public biographical
 * record and describe real historical people, so they are `real-world`.
 */

const AUDIT_DATE = '2026-09-18';

export const vessels: Vessel[] = [
  {
    id: 'aglaonike',
    slug: 'aglaonike',
    name: 'Aglaonike of Thessaly',
    className: 'Nanjing',
    vesselType: 'PCTC',
    imo: '1999870',
    mmsi: 'MID260125',
    callSign: 'MEWQ',
    yearLaunched: 2020,
    serviceId: 'optimed',
    namesake: {
      fullName: 'Aglaonike of Thessaly',
      lifespan: 'c. 2nd–1st century BCE',
      field: 'Astronomy',
      biography:
        'Aglaonike is the first woman astronomer recorded in ancient Greek sources. Plutarch describes her as able to predict lunar eclipses, which she is said to have presented as the power to make the Moon disappear. Her reputation survives mainly through the writings of others, a pattern common to women in early science.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'inherited',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'Identity data copied from the legacy fleet table. No technical particulars published; product owner to supply length, capacity and service speed.',
    },
  },
  {
    id: 'caroline-herschel',
    slug: 'caroline-herschel',
    name: 'Caroline Herschel',
    className: 'G4 Freighter',
    vesselType: 'ConRo',
    imo: '1999882',
    mmsi: 'MID260223',
    callSign: 'MEXA',
    yearLaunched: 2023,
    serviceId: 'eurasia',
    namesake: {
      fullName: 'Caroline Herschel',
      lifespan: '1750–1848',
      field: 'Astronomy',
      biography:
        'Caroline Herschel was the first woman known to have discovered a comet, and the first in Britain to be paid for scientific work. She catalogued nebulae and star clusters alongside her brother William, and in 1828 received the Gold Medal of the Royal Astronomical Society. No other woman received it for the next 168 years.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'The legacy site spells the vessel "Carolina Herschel". The astronomer is Caroline Herschel. Spelling corrected here; product owner to confirm the intended vessel name.',
    },
  },
  {
    id: 'dorothy-hodgkin',
    slug: 'dorothy-hodgkin',
    name: 'Dorothy Hodgkin',
    className: 'G4 Freighter',
    vesselType: 'ConRo',
    imo: '1999909',
    mmsi: 'MID260225',
    callSign: 'MEXC',
    yearLaunched: 2023,
    serviceId: 'eurasia',
    namesake: {
      fullName: 'Dorothy Crowfoot Hodgkin',
      lifespan: '1910–1994',
      field: 'Chemistry and crystallography',
      biography:
        'Dorothy Hodgkin used X-ray crystallography to determine the three-dimensional structure of penicillin, vitamin B12 and later insulin. She received the Nobel Prize in Chemistry in 1964 and remains the only British woman to have done so. Her work on insulin spanned thirty-five years.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'inherited',
      lastReviewed: AUDIT_DATE,
      reviewNote: 'No technical particulars published on the legacy site.',
    },
  },
  {
    id: 'frances-allen',
    slug: 'frances-allen',
    name: 'Frances Allen',
    className: 'Reffles',
    vesselType: 'ConRo',
    imo: '1999941',
    mmsi: 'MID260230',
    callSign: 'MEXH',
    yearLaunched: 2024,
    serviceId: 'westmed',
    namesake: {
      fullName: 'Frances Elizabeth Allen',
      lifespan: '1932–2020',
      field: 'Computer science',
      biography:
        'Frances Allen pioneered the theory and practice of optimising compilers, the software that turns readable source code into fast machine code. In 2006 she became the first woman to receive the Turing Award. She spent her entire career at IBM, where she was also its first female Fellow.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'Class recorded on the legacy site as "Reffles". Likely a misspelling of "Raffles". Product owner to confirm the intended class name.',
    },
  },
  {
    id: 'gerty-cori',
    slug: 'gerty-cori',
    name: 'Gerty Cori',
    className: 'G4 Freighter',
    vesselType: 'ConRo',
    imo: '1999894',
    mmsi: 'MID260224',
    callSign: 'MEXB',
    yearLaunched: 2023,
    serviceId: 'eurasia',
    namesake: {
      fullName: 'Gerty Theresa Cori',
      lifespan: '1896–1957',
      field: 'Biochemistry',
      biography:
        'Gerty Cori described how the body converts glycogen to glucose and back, the cycle that now carries her name. In 1947 she became the first woman to win the Nobel Prize in Physiology or Medicine. For years she held a research post at a fraction of her husband’s salary while doing the same work.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'inherited',
      lastReviewed: AUDIT_DATE,
      reviewNote: 'No technical particulars published on the legacy site.',
    },
  },
  {
    id: 'hagnodice',
    slug: 'hagnodice',
    name: 'Hagnodice of Athens',
    className: 'Nanjing',
    vesselType: 'PCTC',
    imo: '1999856',
    mmsi: 'MID260123',
    callSign: 'MEWO',
    yearLaunched: 2020,
    serviceId: 'optimed',
    namesake: {
      fullName: 'Hagnodice of Athens',
      lifespan: 'c. 4th century BCE',
      field: 'Medicine',
      biography:
        'Hagnodice is described in Roman sources as the first woman physician in Athens, said to have studied and practised in disguise at a time when women were barred from medicine. Whether she was a historical individual or a figure standing for many is still debated, which is itself part of why the story endures.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'inherited',
      lastReviewed: AUDIT_DATE,
      reviewNote: 'No technical particulars published on the legacy site.',
    },
  },
  {
    id: 'halide-edib-adivar',
    slug: 'halide-edib-adivar',
    name: 'Halide Edib Adıvar',
    className: 'Reffles',
    vesselType: 'ConRo',
    imo: '1999945',
    mmsi: 'MID260233',
    callSign: 'MEXJ',
    yearLaunched: 2024,
    serviceId: 'eurasia',
    namesake: {
      fullName: 'Halide Edib Adıvar',
      lifespan: '1884–1964',
      field: 'Literature and education',
      biography:
        'Halide Edib Adıvar was a Turkish novelist, academic and campaigner for women’s education. She organised schools and orphanages, served at the front during the Turkish War of Independence, and later taught English literature at Istanbul University. Her novels are still read as accounts of a society remaking itself.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'Class recorded as "Reffles" on the legacy site. Likely "Raffles". No technical particulars published.',
    },
  },
  {
    id: 'maria-goeppert-mayer',
    slug: 'maria-goeppert-mayer',
    name: 'Maria Goeppert-Mayer',
    className: 'G4 Freighter',
    vesselType: 'ConRo',
    imo: '1999911',
    mmsi: 'MID260226',
    callSign: 'MEXD',
    yearLaunched: 2023,
    serviceId: 'eurasia',
    namesake: {
      fullName: 'Maria Goeppert-Mayer',
      lifespan: '1906–1972',
      field: 'Theoretical physics',
      biography:
        'Maria Goeppert-Mayer proposed the nuclear shell model, explaining why certain numbers of protons and neutrons make a nucleus unusually stable. She shared the 1963 Nobel Prize in Physics, only the second woman to receive it. For much of her career she worked unpaid, because universities refused to employ the wife of a professor.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'inherited',
      lastReviewed: AUDIT_DATE,
      reviewNote: 'No technical particulars published on the legacy site.',
    },
  },
  {
    id: 'merce-rodoreda',
    slug: 'merce-rodoreda',
    name: 'Mercè Rodoreda',
    className: 'Reffles',
    vesselType: 'ConRo',
    imo: '1999937',
    mmsi: 'MID260228',
    callSign: 'MEXF',
    yearLaunched: 2024,
    serviceId: 'eastmed',
    namesake: {
      fullName: 'Mercè Rodoreda',
      lifespan: '1908–1983',
      field: 'Literature',
      biography:
        'Mercè Rodoreda is the most widely translated Catalan novelist. She wrote much of her work in exile in France and Switzerland after 1939. La plaça del Diamant, published in 1962, follows an ordinary woman through the Spanish Civil War and is read across the world as a portrait of Barcelona itself.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'The legacy site spells the vessel "Merce Rodoreda" without the accent. Correct Catalan spelling is Mercè Rodoreda, used here. Class "Reffles" also to be confirmed.',
    },
  },
  {
    id: 'nawal-el-saadawi',
    slug: 'nawal-el-saadawi',
    name: 'Nawal El Saadawi',
    className: 'Reffles',
    vesselType: 'ConRo',
    imo: '1999943',
    mmsi: 'MID260231',
    callSign: 'MEXI',
    yearLaunched: 2024,
    serviceId: 'westmed',
    namesake: {
      fullName: 'Nawal El Saadawi',
      lifespan: '1931–2021',
      field: 'Medicine and writing',
      biography:
        'Nawal El Saadawi was an Egyptian physician, psychiatrist and writer whose books on the position of women in the Arab world reached readers in more than forty languages. She served as Egypt’s Director of Public Health, was imprisoned for her writing in 1981, and kept publishing for another four decades.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote: 'Class "Reffles" to be confirmed. No technical particulars published.',
    },
  },
  {
    id: 'rita-levi-montalcini',
    slug: 'rita-levi-montalcini',
    name: 'Rita Levi-Montalcini',
    className: 'G4 Freighter',
    vesselType: 'ConRo',
    imo: '1999935',
    mmsi: 'MID260227',
    callSign: 'MEXE',
    yearLaunched: 2023,
    serviceId: 'eurasia',
    namesake: {
      fullName: 'Rita Levi-Montalcini',
      lifespan: '1909–2012',
      field: 'Neurobiology',
      biography:
        'Rita Levi-Montalcini discovered nerve growth factor, the protein that tells nerve cells to grow. Barred from academic work by Italy’s 1938 racial laws, she built a laboratory in her bedroom and continued. She received the Nobel Prize in 1986 and served in the Italian Senate into her late nineties.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'inherited',
      lastReviewed: AUDIT_DATE,
      reviewNote: 'No technical particulars published on the legacy site.',
    },
  },
  {
    id: 'rosa-sensat',
    slug: 'rosa-sensat',
    name: 'Rosa Sensat',
    className: 'Autonomous Electric',
    vesselType: 'Autonomous electric cargo vessel',
    imo: '1999947',
    mmsi: 'MID260235',
    callSign: 'MEXK',
    yearLaunched: 2024,
    serviceId: null,
    namesake: {
      fullName: 'Rosa Sensat i Vilà',
      lifespan: '1873–1961',
      field: 'Education',
      biography:
        'Rosa Sensat renewed Catalan schooling by taking children outdoors, treating observation as the starting point of learning. She directed the Escola del Bosc in Barcelona from 1914. The teacher training association founded in her name in 1965 still shapes how teachers are prepared in Catalonia.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'Recorded on the legacy site as service "Pilot" rather than a commercial service. Treated here as a pilot vessel not assigned to a published rotation. Product owner to confirm.',
    },
  },
  {
    id: 'sappho',
    slug: 'sappho',
    name: 'Sappho',
    className: 'Reffles',
    vesselType: 'ConRo',
    imo: '1999939',
    mmsi: 'MID260229',
    callSign: 'MEXG',
    yearLaunched: 2024,
    serviceId: 'eastmed',
    namesake: {
      fullName: 'Sappho of Lesbos',
      lifespan: 'c. 630–570 BCE',
      field: 'Poetry',
      biography:
        'Sappho wrote lyric poetry on Lesbos in the seventh century BCE and was read across the ancient Mediterranean. Only one poem survives complete; the rest reach us as fragments, several recovered from papyrus in the last hundred years. Ancient writers simply called her the Poetess.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'needs-review',
      lastReviewed: AUDIT_DATE,
      reviewNote: 'Class "Reffles" to be confirmed. No technical particulars published.',
    },
  },
  {
    id: 'theano-of-crotone',
    slug: 'theano-of-crotone',
    name: 'Theano of Crotone',
    className: 'Nanjing',
    vesselType: 'PCTC',
    imo: '1999868',
    mmsi: 'MID260124',
    callSign: 'MEWP',
    yearLaunched: 2020,
    serviceId: 'optimed',
    namesake: {
      fullName: 'Theano of Crotone',
      lifespan: 'c. 6th century BCE',
      field: 'Mathematics and philosophy',
      biography:
        'Theano belonged to the Pythagorean school at Crotone, one of the few philosophical communities of its time to admit women. Later sources credit her with work on proportion and the golden mean, and with leading the school after Pythagoras died. The surviving texts under her name are of uncertain authorship.',
    },
    particulars: {},
    meta: {
      source: 'legacy-site',
      status: 'inherited',
      lastReviewed: AUDIT_DATE,
      reviewNote:
        'Published on the legacy site at the URL /teano while the fleet table reads "Theano of Crotone". Canonical spelling used here is Theano.',
    },
  },
];

/** Look up a vessel by its stable id. */
export function getVesselById(id: string): Vessel | undefined {
  return vessels.find((vessel) => vessel.id === id);
}

/** Every vessel deployed on a given service, in fleet order. */
export function getVesselsByService(serviceId: string): Vessel[] {
  return vessels.filter((vessel) => vessel.serviceId === serviceId);
}

/**
 * Redirects from the legacy sdglines.com addresses.
 *
 * Built from the URL inventory captured during the audit of 18 September 2026
 * (see docs/migration.md for the full table with the reasoning per row).
 *
 * GitHub Pages cannot issue an HTTP 301, so Astro emits a small HTML page with
 * a meta refresh and a canonical link for each entry. That is slower than a
 * real redirect and search engines treat it as a weaker signal, but it keeps
 * every old bookmark, course handout and learning-platform link working, which
 * is the point.
 *
 * Addresses deliberately NOT redirected:
 *
 *   /securing-air-cargo
 *       An air cargo article that was published on the shipping line site.
 *       It belongs to SDG Airlines. Sent to the resources index rather than
 *       given a home here.
 *
 *   /https-//sdglines-com/port-of-oran
 *   /https-//sdglines-com/port-of-nouakchott
 *       Malformed addresses produced by a content management error. They never
 *       resolved, so nothing links to them meaningfully, but they are mapped
 *       anyway because they appear in the legacy sitemap and therefore in
 *       search results.
 */

/** Vessel pages. The legacy site used one top level path per vessel. */
const vesselRedirects = {
  '/aglaonike': '/fleet/aglaonike',
  '/carolina': '/fleet/caroline-herschel',
  '/dorothy-hodgkin': '/fleet/dorothy-hodgkin',
  '/Frances-Allen': '/fleet/frances-allen',
  '/gerty-cori': '/fleet/gerty-cori',
  '/hagnodice': '/fleet/hagnodice',
  '/halide-edib-adıvar': '/fleet/halide-edib-adivar',
  '/maria-goeppert-mayer': '/fleet/maria-goeppert-mayer',
  '/merce-rodoreda': '/fleet/merce-rodoreda',
  '/nawal-el-saadawi': '/fleet/nawal-el-saadawi',
  '/rita-levi-montalcini': '/fleet/rita-levi-montalcini',
  '/rosa-sensat': '/fleet/rosa-sensat',
  '/sappho': '/fleet/sappho',
  '/teano': '/fleet/theano-of-crotone',
  '/thefleet': '/fleet',
  '/the-fleet': '/fleet',
};

/**
 * Port pages. The legacy site was inconsistent: some ports used a bare city
 * name and others a `port-of-` prefix, and several were misspelled.
 */
const portRedirects = {
  '/barcelona': '/ports/barcelona',
  '/valencia': '/ports/valencia',
  '/marseille': '/ports/marseille',
  '/genoa': '/ports/genoa',
  '/civitavecchia': '/ports/civitavecchia',
  '/izmir': '/ports/izmir',
  '/beirut': '/ports/beirut',
  '/aqaba': '/ports/aqaba',
  '/misurata': '/ports/misurata',
  '/port-said': '/ports/port-said',
  '/pireaus': '/ports/piraeus',
  '/valleta': '/ports/valletta',
  '/danietta': '/ports/damietta',
  '/rades-la-goulette': '/ports/rades-la-goulette',
  '/port-of-abu-dahbi': '/ports/abu-dhabi',
  '/port-of-algier': '/ports/algiers',
  '/port-of-antwerp': '/ports/antwerp',
  '/port-of-bar': '/ports/bar',
  '/port-of-bari': '/ports/bari',
  '/port-of-busan': '/ports/busan',
  '/port-of-casablanca': '/ports/casablanca',
  '/port-of-durres': '/ports/durres',
  '/port-of-felixtowe': '/ports/felixstowe',
  '/port-of-hamburg': '/ports/hamburg',
  '/port-of-jeddah': '/ports/jeddah',
  '/port-of-las-palmas': '/ports/las-palmas',
  '/port-of-le-havre': '/ports/le-havre',
  '/port-of-lisbon': '/ports/lisbon',
  '/port-of-mumbai': '/ports/mumbai',
  '/port-of-palermo': '/ports/palermo',
  '/port-of-palma-de-mallorca': '/ports/palma-de-mallorca',
  '/port-of-rotterdam': '/ports/rotterdam',
  '/port-of-salalah': '/ports/salalah',
  '/port-of-tanger-med': '/ports/tanger-med',
  '/https-//sdglines-com/port-of-oran': '/ports/oran',
  '/https-//sdglines-com/port-of-nouakchott': '/ports/nouakchott',
  // The ports of call index. Its legacy name was a content management default
  // that was never changed: "página en blanco" is Spanish for "blank page".
  '/página-en-blanco-calls': '/ports',
};

/** Routes, cargo services, equipment and everything else. */
const contentRedirects = {
  '/eastmed': '/routes/eastmed',
  '/westmed': '/routes/westmed',
  '/eurasia': '/routes/eurasia',
  '/Optimed': '/routes/optimed',
  '/gimnesias': '/routes/gimnesias',

  '/containers': '/equipment/containers',
  '/flat-racks': '/equipment/flat-racks',
  '/roll-trailers': '/equipment/roll-trailers',
  '/container-packing': '/equipment/packing',
  '/how-to-pack-a-container': '/equipment/packing',

  '/ColdChain': '/services/cold-chain',
  '/dangerous-goods': '/services/dangerous-goods',

  '/agency': '/ports/agencies',
  '/agencies': '/ports/agencies',
  '/OwnersRepresentatives': '/ports/agencies',

  '/quotation': '/quote',
  '/arrival-charges': '/resources/arrival-charges',
  '/CustomerService': '/resources/customer-service',

  // Environment and Sustainability were two pages covering one subject.
  '/environment': '/about/sustainability',
  '/sustainability': '/about/sustainability',
  '/quality': '/about/quality',
  '/digitalization': '/about/digitalisation',

  // News. The three legacy articles were dated October 2020 and described
  // Escola Europea activities rather than the simulation, so they are archived
  // rather than migrated; the addresses point at the updates page.
  '/news': '/resources/news',
  '/escola-europea-technical-courses': '/resources/news',
  '/shippings-main-challenge-is-to-use-the-massive-introduction-of-the-digital-tools':
    '/resources/news',
  '/yep-med-project-employment-opportunities-for-the-mediterranean-youth': '/resources/news',

  // Air cargo content that was published on the shipping line site.
  '/securing-air-cargo': '/resources',
};

export const legacyRedirects = {
  ...vesselRedirects,
  ...portRedirects,
  ...contentRedirects,
};

/** Number of legacy addresses covered. Reported in docs/migration.md. */
export const legacyRedirectCount = Object.keys(legacyRedirects).length;

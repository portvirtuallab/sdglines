# Changelog

Notable changes to the SDG Lines website. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Changes that affect how the site is used in a training exercise are also summarised for trainers at
`/resources/news`.

## [Unreleased]

### Fixed

- The quotation now charges the sea freight for every container booked, not once per quotation, and
  applies the equipment factor the spreadsheet computed and then discarded. A 20' reefer no longer
  pays a 40' dry container's rate.
- The port additional grows in step with the order rather than with its square. At 25 units the old
  rule charged 25 times too much.
- Emissions and the ETS surcharge count every container.
- The reefer plug-in and the bunker recovery are charged per container, as both are in practice.

  The four faults above are in the live spreadsheet this tool replaces. The first build reproduced
  them deliberately, for parity; they were fixed on the product owner's instruction on 2026-09-23.
  The spreadsheet's own arithmetic is kept as `legacy` pricing rules, used only by the regression
  suite, so the 202 historical quotations still prove the tariff tables were read correctly.
  See section 9 of `docs/quote/pricing-model.md`.

- Palma can be quoted. The workbook gives it no freight rate or port class; the product owner
  supplied class D and base index 100 on 2026-09-23.
- The destination list is now built by the journey search itself rather than by a second walk over
  the rotations, so it can no longer offer a port the search would refuse.

- The quotation states the price per unit and the price per TEU equivalent beside the total, and
  offers two comparisons: the same shipment at other order sizes, and at every other unit type on
  the lane. Both are collapsed by default and both are priced by the same engine as the quotation,
  so they cannot disagree with it.

### Removed

- The PBKDF2 check of the Port Virtual Lab code. A four-digit code checked in a browser cannot be an
  access control whatever it is built from, and machinery that implies otherwise is worse than none.
  The field remains as an activity reference, validated for format. See
  `docs/quote/pin-validation.md`.

### Changed

- The quotation form moved from `/quote` to `/request-a-quote` and now prices a shipment rather
  than only recording it. The old address redirects.
- Journey search prefers the itinerary with fewest vessels before the fastest one. Transit times are
  sailing times and cannot count the wait for a connecting vessel, because no sailing frequency is
  published, so ranking on time alone made transshipment look better than it is.
- The quotation breakdown states, for every line, whether it follows the container or the shipment,
  and says when a freight rate was interpolated rather than published.
- The import checks that a unit type which names its own length actually is that long. It is not:
  the workbook gives the 45-foot roll trailer 6.096 linear metres, which is a 20-foot unit, and both
  the freight rate and the TEU equivalent follow that figure.

### Added

- Complete rebuild of the website on Astro 5, TypeScript and Tailwind 4, deployed as a static site
  to GitHub Pages.
- Compact primary navigation of seven sections, replacing a menu of more than seventy items.
- Searchable port directory covering all 36 ports of call, with filters by region, service and free
  text, rendered on the server so it works without JavaScript.
- Route pages publishing a full rotation as an ordered table, the vessels deployed and the cargo
  accepted. The legacy pages published none of this.
- Fleet register with the identity data for all fourteen vessels, plus a page for each.
- The spirit of the vessels: the fourteen women the fleet is named after, ordered as a timeline.
- Equipment catalogue with internal dimensions, tare weights and payloads, which the legacy site did
  not publish.
- Arrival charge catalogue: eleven charge types with basis, payer and common pitfalls.
- Quotation tool at `/request-a-quote`, driven by the SDG Lines operational workbooks. Six guided
  steps produce a routing, a vessel, a transit time and a full price breakdown in the browser. It
  replaces the Google Form the simulation ran on, and reproduces the prices that process produced to
  the cent. Nothing is transmitted and no personal data is collected.
- Import step (`npm run import:workbook`) turning the two operational Excel workbooks into
  structured TypeScript: 37 ports, 5 rotations over 57 legs, 19 vessels, 16 unit types, 1 332 port
  pair distances and the tariff tables. It reports every correction it applies and everything that
  needs a human decision, and it never emits the Port Virtual Lab PIN codes the workbook holds.
- Regression suite replaying all 202 quotations the workbooks record, asserting every charge to the
  cent, plus a routing suite checking the 45 itineraries the current process publishes.
- Site-wide search over ports, routes, vessels, equipment, services, charges and pages, indexed at
  build time.
- Interactive network map, loaded only on its own page, always accompanied by the rotations as
  tables.
- Verification metadata on every content record, recording where each value came from and whether it
  has been confirmed, rendered on the page.
- Content integrity test suite covering referential integrity in both directions.
- Accessibility test suite: axe-core across 18 templates on desktop and mobile.
- Redirects covering all 80 legacy addresses that moved.

### Changed

- Routes and cargo services separated. Routes answers where; Services answers what.
- The About page is now about SDG Lines. It previously described Escola Europea.
- Section menus open on click rather than hover, and close with Escape.
- Environment and Sustainability merged into one page.
- Digitalization renamed to Digitalisation, matching the rest of the site.
- Port spellings corrected: Piraeus, Valletta, Felixstowe, Abu Dhabi, Algiers, Damietta.
- Vessel names corrected: Caroline Herschel and Mercè Rodoreda. Both pending confirmation.

### Removed

- Three customer testimonials. They attributed praise to named individuals for a company that
  carries no cargo.
- Three news articles from October 2020 describing Escola Europea activities rather than the
  simulation.
- An air cargo article published on the shipping line site.
- Hero slogans making commercial guarantees the simulation cannot honour.

### Fixed

- The Arrival Charges link, which redirected to the home page.
- Two malformed port addresses that never resolved.
- The ports index, previously published at a content management default address meaning
  "blank page" in Spanish.
- Colour contrast on small monospace labels, which failed WCAG AA.
- Horizontally scrolling tables, which could not be scrolled with a keyboard.
- Section menus closing immediately when clicked by a pointer user, because hover had already
  opened them.

### Known limitations

Recorded in full in `docs/open-questions.md`. The largest: service frequencies and transit times,
arrival charge amounts, and technical particulars for the fourteen vessels. None were published on
the previous site, and none are estimated here.

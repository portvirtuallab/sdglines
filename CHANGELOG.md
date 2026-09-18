# Changelog

Notable changes to the SDG Lines website. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Changes that affect how the site is used in a training exercise are also summarised for trainers at
`/resources/news`.

## [Unreleased]

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
- Simulated quotation form with client-side validation and a derived quotation reference. Nothing is
  transmitted and no personal data is collected.
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

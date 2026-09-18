# Testing

```bash
npm test                  # Unit and content integrity (Vitest)
npm run validate:content  # Content integrity only — run after any data edit
npm run test:e2e          # Journeys and accessibility (Playwright)
```

---

## What is tested, and why those things

### Content integrity — `tests/unit/content-integrity.test.ts`

**23 tests.** TypeScript checks that a port id is a string. It cannot check that the string names a
port that exists. This suite covers that gap, which is where the real content bugs live.

- **Uniqueness.** No two ports, services, vessels or equipment records share an id or a slug. No two
  vessels share an IMO, MMSI or call sign.
- **Slug shape.** Every slug is lowercase, hyphenated and URL-safe.
- **References resolve.** Every rotation calls at a port that exists; every service deploys a vessel
  that exists; every vessel is assigned to a service that exists.
- **References agree in both directions.** This is the important one. If Beirut says it is on
  Eastmed, Eastmed's rotation must include Beirut, and the reverse. A one-sided link produces a port
  page and a route page that contradict each other, which is worse than either being empty.
- **Rotation numbering** is sequential from 1.
- **Verification metadata.** Every record has a valid review date, and anything flagged for review
  has a note explaining why — a flag with no explanation tells a reviewer nothing.
- **Geography.** Coordinates are within possible bounds, LOCODEs are five characters, and each
  LOCODE starts with its port's country code.
- **Search index.** Every entry points at an internal path, every port, service, vessel and prose
  page is indexed, and every entry has keywords.
- **Editorial rules.** A vessel publishing technical particulars must be marked `verified` — the
  test that stops an estimate being published as fact. Every prose page has a meta description of a
  sensible length.

### Journeys — `tests/e2e/journeys.spec.ts`

The tasks the site exists to support, taken from the project objectives. Run on **desktop and
mobile** viewports against the **production build**, not the dev server.

- Find a route, reaching a rotation table from the home page
- Find a port, including filtering, the empty state, and **working with JavaScript disabled**
- View a vessel, including the pilot vessel with no service and a vessel with no particulars
- Check arrival charges, including filtering by cargo type
- Complete a quotation: validation, the same-port rejection, the generated reference, and
  pre-selection when arriving from a port page
- Search by port, vessel, charge code and an accented name
- Navigate: opening a section menu from the keyboard, closing it with Escape, and the 404 page

Two of these deserve comment.

**"Works without JavaScript"** is not a curiosity. It proves the port directory is genuinely server
rendered rather than rendered by a script that happens to run quickly.

**The section menu test** found a real bug. Playwright moves the pointer to a control before
clicking it, which fired the hover handler and opened the panel, so the click handler saw it as
already open and closed it again. A mouse user could not open the menu by clicking. The fix
distinguishes hover-opened from click-opened panels.

### Accessibility — `tests/e2e/accessibility.spec.ts`

axe-core against **18 pages covering every distinct template**, on desktop and mobile, tagged
`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`. Plus:

- Exactly one `h1` per page, on every template
- The simulation notice visible on every page type
- The skip link receives focus on first Tab and moves focus to the main content

**Current result: 0 violations** across all 18 templates on both viewports.

Two real failures were found and fixed by this suite rather than by a person:

1. **Contrast.** `navy-400` on `navy-50` measured about 3.4:1, used for LOCODEs and small monospace
   labels across several pages.
2. **Scrollable regions.** Horizontally scrolling tables were not reachable by keyboard. They now
   carry `tabindex="0"`, a `role` and a label.

---

## What is deliberately not tested

**Visual regression.** No screenshot comparison. It is high maintenance and mostly catches
intentional changes. The layout is simple enough that a broken page is obvious.

**Unit tests for rendering.** Component rendering is covered by the end-to-end suite against real
pages, which is where rendering bugs actually show up.

**Cross-browser.** Chromium only. Adding Firefox and WebKit is a two-line change to
`playwright.config.ts` if a browser-specific problem is ever reported; until then it triples CI time
for no observed benefit on a site with no exotic CSS.

**Automated link checking of external URLs.** Internal links are covered by the journeys and by the
search index test. External links are few and stable.

---

## What automated testing does not cover

Roughly a third of WCAG failures are machine-detectable. The rest need a person. Manual checks
carried out, and to be repeated before any significant release:

- Keyboard-only navigation through a complete journey: home → route → port → quotation
- Screen reader announcement of filter result counts and form error summaries
- Reading the site at 200% browser zoom
- The site with `prefers-reduced-motion` enabled
- Reading a schedule table on a phone

---

## Running the end-to-end suite

Playwright builds the site and serves it with `astro preview` automatically. First run:

```bash
npx playwright install chromium
npm run test:e2e
```

Useful flags:

```bash
npx playwright test --project=desktop-chromium   # one viewport
npx playwright test -g "quotation"               # one group
npx playwright test --headed --debug             # watch it run
npx playwright show-report                       # after a failure
```

### One thing to know before writing a test

The site is served under a base path. Playwright resolves a path beginning with `/` against the
**origin** of `baseURL`, discarding the path component — so `page.goto('/routes')` would request
`/routes`, which does not exist.

Always navigate through the helper:

```ts
import { path } from './helpers';
await page.goto(path('/routes'));
```

This also means the suite exercises the real base path, so a base path regression fails the tests
instead of reaching production.

---

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main` and `develop`:
formatting, lint, type check, content integrity, unit tests, production build, then the end-to-end
and accessibility suite in a second job.

All of it has to pass before a merge.

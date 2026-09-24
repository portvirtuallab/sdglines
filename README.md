# SDG Lines

The website of **SDG Lines®**, the simulated shipping company of **Port Virtual Lab**, operated by
**Escola Europea – Intermodal Transport** for education and professional training.

> **SDG Lines is an educational simulation. It does not provide real transport services.**
>
> It has no vessels, moves no cargo and holds no licences. The IMO numbers, MMSI identifiers, call
> signs and agency addresses on this site belong to the simulation and correspond to nothing in the
> real world.

---

## What this is for

SDG Lines exists so that learners can practise maritime logistics on something that behaves like a
real carrier without the consequences of using one. During a Port Virtual Lab exercise, participants
use this site the way they would use a carrier website: to find a service, check what equipment fits
the cargo, look up what will be charged on arrival, and request a quotation.

The primary objective of the site is stated plainly, because it drives every design decision:

> **Help a participant find the information they need to make a decision, quickly, in the middle of
> a training session, on whatever device they have with them.**

### Its place in the ecosystem

|                         |                                                            |
| ----------------------- | ---------------------------------------------------------- |
| **Owner and operator**  | Escola Europea – Intermodal Transport                      |
| **Environment**         | Port Virtual Lab (PVL.ONE)                                 |
| **Sibling simulations** | SDG Airlines®, MEDtrade®, Playforwarding®                  |
| **Production language** | International English (the architecture is ready for more) |

---

## Technology

| Concern       | Choice                           | Why                                                                                                                   |
| ------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Framework     | [Astro 5](https://astro.build)   | Ships zero JavaScript by default. Most of this site is text and tables, and it should cost what text and tables cost. |
| Language      | TypeScript (strict)              | The content model is the heart of the project; types are what keep 36 ports, 5 routes and 14 vessels consistent.      |
| Styling       | Tailwind CSS 4                   | CSS-first configuration, so the design tokens live in `src/styles/global.css` and nowhere else.                       |
| Interactivity | Vanilla JS, plus React islands   | Filters and forms are plain DOM scripting over server-rendered HTML. React is used only for the interactive map.      |
| Mapping       | [Leaflet](https://leafletjs.com) | Loaded on one page only, and never as the sole route to the information.                                              |
| Fonts         | Self-hosted variable fonts       | No request to a third-party font host, so no visitor IP address is disclosed to one.                                  |
| Tests         | Vitest, Playwright, axe-core     | Content integrity, user journeys and accessibility.                                                                   |
| Hosting       | GitHub Pages                     | Static files, no server to maintain, no runtime to patch.                                                             |

### Why Astro rather than Next.js

The brief proposed Next.js with static export and allowed Astro as an alternative if Next.js
introduced unnecessary limitations. Astro was chosen. The reasoning, recorded in full in
[`docs/architecture.md`](docs/architecture.md):

- **Zero JavaScript by default.** Next.js static export still ships a React runtime to every page.
  A port page here is HTML and CSS and nothing else. On a classroom phone over conference Wi-Fi,
  that difference is the difference between usable and not.
- **Simpler base path handling.** Next.js on GitHub Pages needs `basePath`, `assetPrefix`, a custom
  image loader and `.nojekyll`, and gets each one subtly wrong at least once. Astro needs `base`.
- **Islands where they are actually needed.** The interactive map is the only component on the site
  that genuinely needs a component framework, and Astro lets it be the only one that pays for it.

---

## Getting started

Requires **Node 20 or later**.

```bash
git clone https://github.com/portvirtuallab/sdglines.git
cd sdglines
npm install
npm run dev
```

The development server runs at **http://localhost:4321/sdglines/** — note the `/sdglines` base
path, which matches the GitHub Pages deployment.

### Commands

| Command                    | What it does                                                        |
| -------------------------- | ------------------------------------------------------------------- |
| `npm run dev`              | Development server with hot reloading                               |
| `npm run build`            | Type check, then build the production site into `dist/`             |
| `npm run build:pages`      | Build without the type check (used by CI, which checks separately)  |
| `npm run preview`          | Serve the production build locally                                  |
| `npm run typecheck`        | `astro check` across every `.astro`, `.ts` and `.tsx` file          |
| `npm run lint`             | ESLint, zero warnings tolerated                                     |
| `npm run format`           | Rewrite with Prettier                                               |
| `npm run format:check`     | Verify formatting without rewriting                                 |
| `npm test`                 | Vitest unit and content integrity tests                             |
| `npm run validate:content` | Content integrity only — run this after editing data                |
| `npm run test:e2e`         | Playwright journeys and accessibility, against the production build |
| `npm run import:workbook`  | Rebuild the quotation data from the operational Excel workbooks     |

---

## How the content works

**Nothing is hard-coded into a page.** Every route, port, vessel, container and charge lives in a
typed data file under `src/data/`, and the pages render from it. Adding a port is one entry in one
file; the directory, the map, the search index, the quotation form and the sitemap all pick it up.

### Where to edit what

| To change…                                                               | Edit                         |
| ------------------------------------------------------------------------ | ---------------------------- |
| A port: name, country, position, services, agency                        | `src/data/ports.ts`          |
| A route: rotation, frequency, vessels, cargo accepted                    | `src/data/services.ts`       |
| A vessel: identifiers, particulars, namesake biography                   | `src/data/vessels.ts`        |
| A container or trailer: dimensions, tare, payload                        | `src/data/equipment.ts`      |
| A cargo service: containers, Ro-Ro, cold chain, and so on                | `src/data/cargoServices.ts`  |
| An arrival charge: what it covers, who pays it                           | `src/data/arrivalCharges.ts` |
| An explanatory page: About, Legal, Privacy, Accessibility, Documentation | `src/data/pages.ts`          |
| Navigation, site name, contact details                                   | `src/lib/site.ts`            |
| Colours, typography, spacing                                             | `src/styles/global.css`      |
| Redirects from old addresses                                             | `redirects.mjs`              |

After any data edit, run `npm run validate:content`. It catches the mistakes TypeScript cannot: a
rotation calling at a port that no longer exists, a vessel assigned to a renamed service, a port and
a route that disagree about whether they are connected, a duplicate slug.

### Saying "we do not know"

Every record carries a verification block recording where its values came from and whether anyone
has signed them off:

```ts
meta: {
  source: 'legacy-site',      // real-world | legacy-site | simulation-design | derived
  status: 'needs-review',     // verified | inherited | needs-review
  lastReviewed: '2026-09-18',
  reviewNote: 'Rotation proposed from the published ports of call...',
}
```

Anything not `verified` renders a quiet notice at the foot of the section it applies to. Unknown
values render as **To be confirmed**, never as a plausible estimate.

This is not bureaucracy. A learner quoting an invented transit time in an assessed exercise has no
way of knowing it was invented. The rule is therefore absolute: **if it has not been confirmed, the
site says so.**

Full detail: [`docs/content-model.md`](docs/content-model.md).

---

## Deployment

The site deploys automatically from `main` to the **GitHub Pages preview**:

**https://portvirtuallab.github.io/sdglines/**

### The live website is not affected

`https://www.sdglines.com` continues to be served by its existing host and is **not touched by this
repository**. No workflow here changes DNS, domain configuration or any production file.

Moving the custom domain to this deployment is a manual DNS change requiring explicit authorisation
from the product owner. The procedure, the verification steps and the rollback are documented in
[`docs/custom-domain.md`](docs/custom-domain.md) and [`docs/rollback.md`](docs/rollback.md).

Moving to the custom domain is a configuration change, not a code change:

```bash
SITE_URL=https://www.sdglines.com BASE_PATH=/ npm run build:pages
```

Full procedure: [`docs/deployment.md`](docs/deployment.md).

---

## Accessibility

The site targets **WCAG 2.2 level AA**. Two commitments are worth stating here because they
constrain the design rather than merely describing it:

1. **A map is never the only route to information.** Every rotation drawn on a chart or a map is
   also published as an ordered table, and every port has its own page.
2. **The section menus open on click, not on hover.** The previous site hid its entire information
   architecture behind hover, which is unusable with a keyboard.

Accessibility is verified by axe-core across every page template, on desktop and mobile viewports,
on every pull request. Manual checks and known limitations:
[`docs/accessibility.md`](docs/accessibility.md).

---

## Privacy and security

- No analytics, no trackers, no cookies set by this site.
- Fonts are self-hosted, so displaying a page discloses nothing to a third party.
- The quotation tool runs entirely in the browser and transmits nothing. It asks for a name, an
  e-mail address and an organisation, because they appear on the quotation it produces, and for
  nothing beyond what the exercise uses. Closing the tab discards all of it.
- Map tiles are requested from OpenStreetMap only on `/ports/map`, and only when that page is
  opened.
- No secrets are committed. Deployment uses the GitHub Pages OIDC token and needs no stored
  credential.
- Dependabot is configured for npm and for GitHub Actions.

---

## Contributing

Branching model:

| Branch           | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `main`           | Approved, deployable. Deploys to the preview on every push. |
| `develop`        | Integration branch for work in progress.                    |
| `feature/<name>` | A single feature.                                           |
| `fix/<name>`     | A single fix.                                               |
| `content/<area>` | A content or data update.                                   |

Commits follow Conventional Commits: `feat:`, `fix:`, `content:`, `docs:`, `test:`, `chore:`.

Before opening a pull request:

```bash
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build:pages
```

Full guidance, including the pull request checklist: [`CONTRIBUTING.md`](CONTRIBUTING.md).

### Reporting a problem

Open an issue using one of the templates in `.github/ISSUE_TEMPLATE/`, or write to
**info@escolaeuropea.eu**. Two kinds of report are especially valuable:

- **A value presented as settled when it is not.** That is a defect, not a detail.
- **A barrier that stops someone completing an exercise.** Please include the page, the browser and
  the assistive technology.

---

## Documentation

| Document                                                       | Contents                                                       |
| -------------------------------------------------------------- | -------------------------------------------------------------- |
| [`docs/audit.md`](docs/audit.md)                               | What the previous website contained and what was wrong with it |
| [`docs/migration.md`](docs/migration.md)                       | Every legacy URL, its new home and the decision taken          |
| [`docs/architecture.md`](docs/architecture.md)                 | Stack decisions and the reasoning behind them                  |
| [`docs/content-model.md`](docs/content-model.md)               | Every content type, field by field                             |
| [`docs/design-system.md`](docs/design-system.md)               | Colour, type, spacing, motion, with measured contrast ratios   |
| [`docs/accessibility.md`](docs/accessibility.md)               | Conformance, testing and known limitations                     |
| [`docs/testing.md`](docs/testing.md)                           | What is tested, how, and what is deliberately not              |
| [`docs/deployment.md`](docs/deployment.md)                     | Build, deploy and verify                                       |
| [`docs/custom-domain.md`](docs/custom-domain.md)               | DNS procedure for www.sdglines.com                             |
| [`docs/rollback.md`](docs/rollback.md)                         | How to undo a deployment or a domain move                      |
| [`docs/forms.md`](docs/forms.md)                               | How to connect a real backend to the quotation form            |
| [`docs/quote/architecture.md`](docs/quote/architecture.md)     | How the quotation tool is put together                         |
| [`docs/quote/workbook-audit.md`](docs/quote/workbook-audit.md) | What the operational workbooks contain                         |
| [`docs/quote/pricing-model.md`](docs/quote/pricing-model.md)   | Every pricing rule and where it came from                      |
| [`docs/quote/pin-validation.md`](docs/quote/pin-validation.md) | How PIN codes are handled, and what that buys                  |
| [`docs/open-questions.md`](docs/open-questions.md)             | Everything awaiting the product owner                          |
| [`docs/post-launch.md`](docs/post-launch.md)                   | The first thirty days                                          |

---

## Copyright and trademarks

© Escola Europea Short Sea Shipping, Spain. All rights reserved. Unauthorised use, reproduction or
distribution is prohibited and may result in legal action.

The **Port Virtual Lab®** name and mark, along with **SDG Lines®**, **SDG Airlines®**,
**MEDtrade®** and **Playforwarding®**, are owned by Escola Europea de Short Sea Shipping AEIE.

This work by Escola Europea – Intermodal Transport is licensed under a
[Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/).

Port names, country names and UN/LOCODE identifiers are used descriptively to identify real
geographic locations and imply no association with, or endorsement by, any port authority, terminal
operator or public body.

# Architecture

The decisions that shape this codebase, and what each one costs.

---

## The constraint that drives everything

The site is used by learners in the middle of a training session, often on a phone, often on
conference or campus Wi-Fi, often with a trainer waiting. A page that takes four seconds to become
usable has failed even if it eventually renders perfectly.

That constraint, more than any aesthetic preference, chose the stack.

---

## Framework: Astro, not Next.js

The brief proposed Next.js with static export, and allowed Astro as an alternative if Next.js
created unnecessary limitations. Astro was chosen.

### The reasoning

**1. Zero JavaScript by default.**

A port page on this site is a heading, two tables and some links. Next.js static export still ships
a React runtime and a hydration payload to render that. Astro ships the HTML and the CSS and
nothing else.

Concretely: of the 93 pages built, **one** loads a JavaScript framework — the interactive map at
`/ports/map`. Everything else is either static HTML or static HTML plus a few kilobytes of plain
DOM scripting for a filter or a form.

**2. GitHub Pages base path handling.**

A project site is served from `/sdglines/`, not from `/`. Next.js needs `basePath`, `assetPrefix`,
a custom image loader (because the default one requires a server), `trailingSlash` tuning and a
`.nojekyll` file, and each of those has a failure mode that only appears in production. Astro needs
`base`, and applies it to routes, assets and the sitemap.

**3. Islands where they are needed, and only there.**

The map genuinely benefits from a component framework. Nothing else does. Astro lets the map be the
only thing that pays for React, through `client:visible` — Leaflet and its stylesheet are not even
requested until the map scrolls into view.

**4. Content as data, rendered at build time.**

The content model is the centre of this project. Astro's `getStaticPaths` renders 36 port pages, 14
vessel pages and 5 route pages from typed arrays with no runtime data fetching and no client-side
routing.

### What it costs

- **A smaller ecosystem.** Fewer ready-made integrations than Next.js.
- **Less familiar to React developers.** The `.astro` component format has to be learned, though it
  is close enough to JSX that the learning takes about an hour.
- **`getStaticPaths` is hoisted.** Anything it reads must be imported, not declared in the component
  frontmatter. This caught us once, in `src/pages/equipment/[category].astro`, which is why the
  equipment families live in `src/data/equipmentFamilies.ts`.

### When to revisit

If the site ever needs authenticated pages, server-side personalisation or real form submission
with server validation, the static-first assumption stops holding. At that point the question is
not Astro versus Next.js but static versus hosted, and it should be reopened from there.

---

## Styling: Tailwind 4, CSS-first

Design tokens live in `@theme` in `src/styles/global.css` and nowhere else. Colours are named for
the role they play (`signal` for primary actions, `sea` for secondary emphasis, `eco` for
sustainability) rather than for what they look like, so a rebrand changes those values and nothing
else.

### One configuration note worth knowing

Tailwind's automatic source detection does not resolve reliably when the project sits under a path
containing spaces and parentheses, which is how this repository is checked out on the maintainer's
machine. The symptom is subtle and alarming: the build succeeds, the page renders, and about a
dozen utility classes silently have no effect.

The source tree is therefore declared explicitly:

```css
@source '../**/*.{astro,html,js,jsx,ts,tsx,md,mdx}';
```

Do not remove this line, even though it looks redundant.

---

## Data: typed arrays, not a CMS

Content lives in TypeScript files under `src/data/`. No headless CMS, no database, no API.

**Why.** The content changes rarely — a port is added once a year, a vessel is renamed once — and
its correctness matters enormously. A CMS optimises for frequent edits by non-technical authors,
which is not the problem here. Types, review in a pull request and an integrity test suite optimise
for correctness, which is.

**What it costs.** Editing content requires a Git workflow. For this content, at this rate of
change, that is a reasonable trade, and it means every content change is reviewed and reversible.

**When to revisit.** If a non-technical content editor needs to make weekly changes without help,
add a Git-backed CMS such as Decap that commits to this repository. The data files are already
shaped for it.

---

## The verification model

Every content record carries where its values came from and how far they have been reviewed. See
[`content-model.md`](content-model.md).

This is unusual and worth defending. In a simulation, a reader cannot tell a real fact from a
designed one from an unconfirmed one, and the cost of getting that wrong is a learner citing an
invented transit time in assessed work. Recording provenance in the data, and rendering it on the
page, is the only way to make that distinction visible.

---

## Interactivity

| Feature                | Approach                                 | Why                                                                                     |
| ---------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| Section menus          | Vanilla JS over server-rendered HTML     | Progressive enhancement; the mobile menu is `<details>` and works with no script at all |
| Port directory filters | Vanilla JS filtering the rendered list   | All 36 ports are in the HTML; filtering is an enhancement, not a requirement            |
| Site search            | Compile-time index, inlined as JSON      | No network request, works offline, and nothing can be findable but missing              |
| Quotation form         | Vanilla JS validation                    | No framework needed for six fields; see [`forms.md`](forms.md)                          |
| Network chart          | Inline SVG, no library                   | Above the fold on the home page; costs one request — the page                           |
| Interactive map        | React island + Leaflet, `client:visible` | The only page that pays for it                                                          |

The rule behind this table: **use a framework where it earns its weight, and nowhere else.**

---

## Rendering the network without a map library

`src/components/map/NetworkChart.astro` projects the real port coordinates into SVG using an
equirectangular projection. Over the Mediterranean the distortion is small enough that the shape of
the network reads correctly, and the arithmetic is simple enough to verify by hand.

This appears on the home page and on every route page. Using a tile map there would mean loading a
mapping library and a stream of tile requests before the visitor has read the first sentence, and
would put the network behind a third-party service.

The chart is always accompanied by the same rotation as an ordered table. That is an accessibility
requirement, not a nicety: a chart is unusable with a screen reader no matter how it is marked up.

---

## Directory layout

```
.github/workflows/     CI and GitHub Pages deployment
docs/                  This documentation
public/                Served verbatim: favicon, robots.txt
src/
  components/
    layout/            Header, Footer, Logo, SimulationNotice
    map/               NetworkChart (SVG), NetworkMap (Leaflet island)
    ui/                PageHeader, ReviewNotice, EquipmentTable, Prose*
  data/                The content model instances
  layouts/             BaseLayout: the single page shell
  lib/                 site.ts (nav, URLs), labels.ts, searchIndex.ts
  pages/               File-based routes
  styles/              global.css: design tokens
  types/               content.ts: the content model
tests/
  unit/                Content integrity
  e2e/                 Journeys and accessibility
redirects.mjs          Legacy URL map
```

---

## Internationalisation

The site ships in English only. The architecture is ready for more but nothing is half-translated,
which the brief explicitly requires.

What is already in place:

- All display strings are in data files or component props, not scattered through markup.
- `SITE.locale` drives the `lang` attribute.
- Slugs are ASCII and stable, so a locale prefix can be added without changing any address.

What adding a locale would require:

1. Enable Astro's i18n routing with a locale prefix.
2. Add a translated field set to the content records (the model is designed for it).
3. Translate `src/data/pages.ts`.
4. Add a language selector to the header.

The sequence matters: do not enable the routing until the content exists, or the site will serve
empty pages in the new locale.

# Design system

All tokens live in `@theme` in [`src/styles/global.css`](../src/styles/global.css). This document
explains what they are for and records the measured contrast of every pairing the interface uses.

---

## Principles

**It should look like a shipping line, not like a course about shipping lines.** The reference
points are carrier operational interfaces, nautical charts and port dashboards — not educational
portals.

**Operational clarity outranks visual interest.** A learner is reading a schedule table under time
pressure. Anything that makes that table harder to scan is wrong, however good it looks.

**No nautical clip art.** No anchors, no ships' wheels, no rope borders. The maritime feeling comes
from chart graticules, coordinates, route lines and typography that handles codes well.

---

## Colour

The palette comes from the SDG Lines logo. The three brand colours were sampled from the artwork
rather than estimated:

| Brand colour | Hex       | In the logo                 | Token        |
| ------------ | --------- | --------------------------- | ------------ |
| Cyan         | `#00b8d8` | The swoosh and the wordmark | `signal-500` |
| Navy         | `#203058` | The dark swoosh             | `navy-700`   |
| Green        | `#40a838` | The accent swoosh           | `eco-500`    |

Each anchors a scale. Tokens are named for the role the colour plays, not for the colour itself.

| Token    | Role                                                          |
| -------- | ------------------------------------------------------------- |
| `navy`   | Primary surface, headings and body text                       |
| `signal` | Brand cyan. **Primary actions only** - never decoration       |
| `sea`    | Deep cyan. Secondary emphasis, links, the sea on charts       |
| `eco`    | Brand green. Sustainability and environmental content only    |
| `alert`  | **Not a brand colour.** Form errors and the simulation notice |

### Two things to know before you use these

**Brand cyan cannot carry white text.** White on `signal-500` measures 2.2:1 and fails badly. A
primary action is therefore **cyan with navy-950 text**, which measures 7.99:1 and is the most
distinctive element on the site. Writing `bg-signal-500 text-white` will look wrong and be
unreadable.

**The logo contains no red.** The `alert` scale exists only for conventions people read without
thinking: a validation error, and the notice saying the site is a simulation. Using brand cyan for
those would make a warning look like a link. Keep it out of anything that is not a warning.

### The discipline that matters

`signal` marks the one action the page most wants you to take, and appears **once** per view. If two
things on a screen are cyan, neither is the primary action.

### Measured contrast

Every pairing used for text or a UI boundary, measured against WCAG 2.2. AA requires 4.5:1 for body
text and 3:1 for large text and UI components. Everything below passes.

#### On white

| Pairing                       |     Ratio |     |
| ----------------------------- | --------: | --- |
| `navy-900` body text          | **17.62** | AA  |
| `sea-800` emphasis            |  **9.73** | AA  |
| `navy-600` secondary text     |  **9.68** | AA  |
| `sea-700` links               |  **7.72** | AA  |
| `navy-500` muted text         |  **6.93** | AA  |
| `eco-700` sustainability text |  **6.42** | AA  |
| `sea-600` focus ring          |  **5.73** | AA  |
| `signal-700` text             |  **5.14** | AA  |

#### White on a coloured surface

| Pairing                          |     Ratio |     |
| -------------------------------- | --------: | --- |
| White on `navy-900`              | **17.62** | AA  |
| White on `navy-800`              | **15.52** | AA  |
| White on `navy-700` (brand navy) | **12.92** | AA  |
| White on `sea-700`               |  **7.72** | AA  |
| White on `eco-700`               |  **6.42** | AA  |

#### The primary action

| Pairing                                 |    Ratio |     |
| --------------------------------------- | -------: | --- |
| `navy-950` on `signal-400` (hover)      | **9.03** | AA  |
| `navy-950` on `signal-500` (brand cyan) | **7.99** | AA  |

#### On the dark navy surfaces

| Pairing                    |     Ratio |     |
| -------------------------- | --------: | --- |
| `navy-100` on `navy-900`   | **14.20** | AA  |
| `sea-200` on `navy-900`    | **12.08** | AA  |
| `navy-200` on `navy-900`   | **10.85** | AA  |
| `sea-300` on `navy-900`    |  **9.21** | AA  |
| `signal-500` on `navy-900` |  **7.42** | AA  |
| `eco-400` on `navy-900`    |  **7.22** | AA  |
| `navy-300` on `navy-900`   |  **7.08** | AA  |

#### On tinted panels

| Pairing               |     Ratio |     |
| --------------------- | --------: | --- |
| `sea-900` on `sea-50` | **10.53** | AA  |
| `eco-900` on `eco-50` |  **9.68** | AA  |

**The shade that keeps catching people out.** `navy-400` fails on both sides: 4.25:1 on white and
4.14:1 on `navy-900`. It is fine for a decorative separator marked `aria-hidden` and wrong for
anything readable. On a light surface use `navy-500` or darker; on a dark one use `navy-300` or
lighter.

Automated checks will not always save you here. axe reports contrast as _incomplete_ rather than
failing when it cannot resolve the background, which is what happens over the `chart-grid` gradient
in the footer. Two footer labels sat at 4.14:1 for a while for exactly that reason, and were found
by measuring rather than by the test suite.

### Service colours

The five route colours have to stay distinguishable from one another on navy while still reading as
part of the brand. Two are brand colours; the other three are chosen to sit apart from them.

| Service   | Hex       |             |
| --------- | --------- | ----------- |
| Westmed   | `#00b8d8` | Brand cyan  |
| Eastmed   | `#2e6be6` | Blue        |
| Optimed   | `#40a838` | Brand green |
| EurAsia   | `#8b5cf6` | Violet      |
| Gimnesias | `#f2a22e` | Amber       |

A service colour is never used on its own: every swatch on the site is paired with the service name.

---

## Logo

The artwork is the real brand asset. It is not redrawn, recoloured or reconstructed. It lives in
`src/assets/` and is served through the Astro image pipeline.

**The header is white because of the logo.** The mark contains a navy swoosh that disappears against
the navy surfaces used elsewhere, and the wordmark is cyan, which is drawn for a light background. A
white header lets the artwork appear exactly as designed.

Where the logo has to sit on navy, as in the footer, the `plate` prop puts it on a white panel. That
is the conventional treatment, and it leaves the artwork untouched.

Derived assets, all generated from the same source:

| File                                | From                            | Used for                      |
| ----------------------------------- | ------------------------------- | ----------------------------- |
| `src/assets/sdg-lines-logo.png`     | The full logo, trimmed          | Header and footer             |
| `src/assets/sdg-lines-mark.png`     | The mark alone                  | Favicons and the social image |
| `public/favicon-32.png`             | The mark on brand navy          | Browser tab                   |
| `public/icons/apple-touch-icon.png` | The mark on brand navy          | Home screen                   |
| `public/images/og-default.png`      | Logo plus the simulation notice | Link previews                 |

The social image carries the simulation notice, so a link shared into a chat or a learning platform
says what the site is before anyone opens it.

---

## Photography

One photograph, in the home page hero: an aerial view of a container ship at sea, from Unsplash.
Credit and licence are recorded in `src/assets/CREDITS.md`.

**How it was chosen matters more than how it looks.** Several better-composed terminal photographs
were rejected because Maersk, Evergreen, ONE and OOCL marks were clearly readable in them. SDG Lines
is a simulated carrier; putting a real carrier's containers on its home page would suggest an
association that does not exist, and would confuse a learner about what SDG Lines is. The photograph
used shows containerised cargo with no legible third-party branding.

Apply the same three tests to any photograph added later:

1. Is the licence clear, and does it permit commercial use?
2. Can you read any third-party carrier, terminal or port operator branding in it?
3. Does the text over it meet contrast **against the overlay**, not against the photograph?

On the third point: the hero text sits on a navy wash that is effectively solid where the copy is,
thinning towards the right so the vessel shows through. Small screens get a near solid vertical wash
instead, because there the copy runs the full width. Contrast is therefore measured against navy and
never against whatever the picture happens to be doing. Automated tools cannot check text over an
image, so this has to be designed rather than tested.

---

## Typography

Three families, each doing a job the others cannot.

| Token            | Family                  | Used for                                                                                       |
| ---------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `--font-display` | Space Grotesk Variable  | Headings. Geometric and contemporary with a slightly technical feel.                           |
| `--font-sans`    | Inter Variable          | Body and operational text. Drawn for screen UI, so it stays legible in a dense schedule table. |
| `--font-mono`    | JetBrains Mono Variable | Codes, IMO numbers, LOCODEs, coordinates, measurements.                                        |

All three are open-source variable fonts, **self-hosted** through `@fontsource-variable`. No request
reaches a third-party font host, so displaying a page discloses no visitor IP address to one, and
the site works behind restrictive networks.

### Why a monospace family for identifiers

An IMO number, a call sign and a UN/LOCODE are read character by character and often transcribed. A
typeface that distinguishes `0` from `O` and `1` from `l` prevents a class of transcription error
that is invisible until an exercise goes wrong. Tables also use `font-variant-numeric: tabular-nums`
so that columns of figures align and can be scanned vertically.

---

## Layout

`.shell` is the page container: full width with a **16px gutter on a phone**, growing to 24px at
640px and 32px at 1024px, centred at a maximum of 80rem.

Detail pages use a two-column grid at `lg` — content and a sticky sidebar — collapsing to a single
column below. The sidebar always holds actions and related links, never information that is only
available there.

---

## Motion

| Token             | Duration | For                           |
| ----------------- | -------- | ----------------------------- |
| `--duration-fast` | 120ms    | Hover and focus states        |
| `--duration-base` | 220ms    | Card lifts, panel transitions |
| `--duration-slow` | 420ms    | Larger transitions            |

Deliberately short. These animations sit in the path of a training exercise, and a slow interface
costs class time.

The one longer animation is the route-drawing on the network chart, at 2.4 seconds. It runs once,
on the home page and route pages, and nothing waits for it.

**`prefers-reduced-motion` is honoured globally** in the base layer: every animation and transition
drops to 0.01ms, and the chart renders its routes already drawn.

---

## Components worth knowing

| Component          | Purpose                                                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SimulationNotice` | The statement that this is not a real carrier. Three variants: `bar` (below the header on every page), `inline` (a panel where surrounding copy could read as a commercial offer), `compact`. |
| `ReviewNotice`     | Renders a record's verification status. Shows nothing when `verified`. Sits at the foot of the section it applies to, never above the content.                                                |
| `PageHeader`       | The single `h1` for every interior page, with breadcrumbs and an optional dark tone.                                                                                                          |
| `NetworkChart`     | Inline SVG of the network from real coordinates. Always accompanied by the same rotation as a table.                                                                                          |
| `EquipmentTable`   | Specification table. Internal dimensions first, because that is what a learner is checking.                                                                                                   |

---

## Rules that are not negotiable

1. **Every page has exactly one `h1`.** Enforced by a test on every template.
2. **A map is never the only route to information.** Every rotation is also a table.
3. **Interactive controls are at least 44×44 CSS pixels** (`.tap-target`).
4. **Focus is always visible**, with a white ring on dark surfaces (`.on-dark`).
5. **Colour is never the only carrier of meaning.** Service colours are always accompanied by the
   service name.
6. **Unknown values render as "To be confirmed"**, never as a plausible estimate.
7. **A primary action is `bg-signal-500` with `text-navy-950`.** Brand cyan cannot carry white text.
8. **The brand artwork is never recoloured.** On a dark surface, put it on a white plate instead.
9. **No photograph with legible third-party carrier branding.** SDG Lines does not imply an
   association with a real carrier, in pictures any more than in words.

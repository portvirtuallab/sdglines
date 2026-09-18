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

Named for the role played, not for the colour seen, so a rebrand changes these values and nothing
else.

| Token                   | Role                                                            |
| ----------------------- | --------------------------------------------------------------- |
| `navy`                  | Primary surface and text. The deep sea.                         |
| `signal`                | The SDG Lines red. **Primary actions only** — never decoration. |
| `sea`                   | Secondary emphasis, links, the sea on charts.                   |
| `eco`                   | Sustainability and environmental content only.                  |
| `slate` / `navy-50…200` | Technical panels, tables, rules.                                |

### The discipline that matters

`signal` marks the action the page most wants you to take, and appears **once** per view. If two
things on a screen are red, neither is the primary action. On the home page it is "Explore the
routes"; on a route page it is "Request a quotation".

### Measured contrast

Every pairing used for text or a UI boundary, measured against WCAG 2.2. AA requires 4.5:1 for body
text and 3:1 for large text and UI components.

#### On white

| Pairing                   |     Ratio |     |
| ------------------------- | --------: | --- |
| `navy-900` body text      | **17.72** | AA  |
| `navy-700` on `navy-50`   | **12.12** | AA  |
| `navy-600` secondary text | **10.97** | AA  |
| `sea-700` links           |  **8.46** | AA  |
| `navy-500` muted text     |  **7.91** | AA  |
| `sea-700` on `navy-50`    |  **7.59** | AA  |
| `navy-500` on `navy-50`   |  **7.09** | AA  |
| `sea-600` focus ring      |  **6.57** | AA  |

#### White on a coloured surface

| Pairing                                |     Ratio |     |
| -------------------------------------- | --------: | --- |
| White on `navy-900`                    | **17.72** | AA  |
| White on `navy-800`                    | **15.77** | AA  |
| White on `sea-700`                     |  **8.46** | AA  |
| White on `signal-700` (hover)          |  **7.82** | AA  |
| White on `eco-700`                     |  **6.03** | AA  |
| White on `signal-600` (primary button) |  **5.88** | AA  |

#### On the dark navy surfaces

| Pairing                  |     Ratio |     |
| ------------------------ | --------: | --- |
| `navy-100` on `navy-900` | **13.50** | AA  |
| `sea-200` on `navy-900`  | **12.61** | AA  |
| `navy-200` on `navy-900` |  **9.82** | AA  |
| `sea-300` on `navy-900`  |  **9.63** | AA  |
| `navy-300` on `navy-900` |  **6.25** | AA  |
| `navy-300` on `navy-800` |  **5.57** | AA  |

#### On tinted panels

| Pairing                     |    Ratio |     |
| --------------------------- | -------: | --- |
| `eco-900` on `eco-50`       | **9.62** | AA  |
| `signal-800` on `signal-50` | **9.07** | AA  |

**The one that caught us.** `navy-400` on `navy-50` measures about 3.4:1 and fails for small text.
It was used for LOCODEs and other small monospace labels, and axe found it during the first
accessibility run. Everything at that size now uses `navy-500` or darker on a light surface. If you
add a small label, use `navy-500`, not `navy-400`.

The reverse trap is real too: `navy-400` on `navy-900` also fails. On dark surfaces, go _lighter_
— `navy-200` or `navy-300`.

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

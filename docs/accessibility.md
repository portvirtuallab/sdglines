# Accessibility

**Target:** WCAG 2.2 level AA.
**Automated result:** 0 axe-core violations across 18 page templates, on desktop and mobile
viewports, checked on every pull request.

The public statement is at `/accessibility`. This document is the working detail.

---

## Why this matters more than usual here

This is not a marketing site where an accessibility failure costs a visitor. It is a reference that
learners use under time pressure during a class. A control that cannot be operated with a keyboard,
or a table that cannot be scrolled with one, costs a participant the exercise while everyone else
moves on.

---

## Decisions that constrain the design

### 1. A map is never the only route to information

The strongest commitment in the project, and the one that shaped the most code.

- The network chart on the home page and route pages is inline SVG marked up as an image with a text
  description. Every rotation it draws is **also** published as an ordered table on the same page.
- The interactive map at `/ports/map` sits **above** the same rotations rendered as tables, one per
  service, with every port linked.
- Every port on any chart has its own page, reachable from the directory at `/ports`, which is
  server-rendered and works with scripts disabled.

A map is unusable with a screen reader no matter how it is marked up. The answer is not better ARIA
on the map; it is that nothing depends on the map.

### 2. Section menus open on click, not on hover

The legacy site hid its entire information architecture behind hover, which is unusable with a
keyboard and unreliable on touch.

Each trigger is a real `<button>` with `aria-expanded`, toggled on click, closed with Escape and on
focus leaving the section. Hover opening is layered on top for pointer users and never replaces the
click behaviour.

The mobile menu is built from `<details>` elements, so it opens and closes with no JavaScript at
all.

### 3. Nothing essential requires JavaScript

- The port directory renders all 36 ports server-side; filtering is an enhancement. Covered by a
  test that runs with `javaScriptEnabled: false`.
- Every table, rotation and specification is in the HTML.
- The search page lists everything, grouped by type, before any script runs.

The quotation form is the exception: it needs JavaScript to validate and produce a reference, and
says so.

---

## Measures in place

**Structure**

- Exactly one `h1` per page, enforced by a test on every template
- Heading levels follow the content with no skipped levels
- Landmarks: `header`, `nav`, `main`, `footer`, with `aria-label` where there is more than one
- `main` carries `id="main"` as the skip link target

**Keyboard**

- Every control reachable and operable
- Skip link as the first focusable element
- Escape closes menus and returns focus to the trigger
- Horizontally scrolling tables carry `tabindex="0"`, `role="region"` and a label — **found by axe,
  not by a person**
- Focus indicators visible on both light and dark surfaces, with a white ring under `.on-dark`

**Forms**

- Every field has a visible, associated `<label>`
- Errors are collected into a summary with `role="alert"`, focused on failed submission, with each
  entry linking to its field
- Messages say what to do — "Choose a different port of discharge" — not what is wrong
- A corrected field re-validates on change, so the error clears when the problem is fixed
- `aria-invalid` and `aria-describedby` on invalid fields

**Dynamic content**

- Filter result counts announced through `role="status"` `aria-live="polite"`, on the port
  directory, the arrival charges page and search
- Search input debounced by 160ms so the live region is not re-announced on every keystroke

**Visual**

- All colour pairings meet AA; measured ratios in [`design-system.md`](design-system.md)
- Colour never the only carrier of meaning — service colours always accompanied by the service name
- Touch targets at least 44×44 CSS pixels
- `prefers-reduced-motion` honoured globally

**Content**

- Alternative text is descriptive where it carries information and empty where decorative
- Links opening in a new tab say so, in visually hidden text
- No link text reads "click here" or "learn more" where a specific action can be named

---

## Testing

Automated, on every pull request: axe-core with `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and
`wcag22aa`, across 18 templates on desktop and mobile.

Automated testing catches roughly a third of WCAG failures. The rest need a person. Manual checks
carried out on the home page, a route page, a port page, the equipment catalogue and the quotation
form:

- Keyboard-only navigation through a complete journey
- Screen reader announcement of filter counts and error summaries
- 200% browser zoom
- `prefers-reduced-motion` enabled
- A schedule table read on a phone

Repeat these before any significant release.

---

## Known limitations

**The interactive map.** Leaflet's keyboard support is limited and its markers are not part of a
sensible tab order. Mitigated by the rotations being published as tables on the same page and by
every port having its own page. The map is marked `role="presentation"` because it duplicates
information available in an accessible form; treating it as a meaningful image would be a claim the
map cannot honour.

**Manual testing coverage.** Automated checks cover a sample of templates rather than every page.
Manual checks cover five pages. A page built from an existing template inherits its behaviour, but a
new template needs its own manual pass.

**Third-party map tiles.** OpenStreetMap tile imagery carries no alternative text and cannot.

---

## If you are adding to the site

1. One `h1`, and add the page to the test list in `tests/e2e/accessibility.spec.ts` if it uses a new
   template.
2. Any new colour pairing measured before it is used. `navy-400` fails on both light and dark
   surfaces — use `navy-500` or darker on light, `navy-300` or lighter on dark.
3. Any new table that can scroll horizontally needs `tabindex="0"`, `role="region"` and a label.
4. Any control that toggles something needs `aria-expanded` and an Escape handler.
5. Any new dynamic count or state change needs a live region.
6. If you add a map or a chart, publish the same information as text on the same page. This is not
   negotiable.

---

## Reporting a barrier

**info@escolaeuropea.eu**, with the page address, what you were trying to do, and the browser and
assistive technology you were using.

A barrier that stops someone completing an exercise is treated as a defect, not a feature request.

# Contributing

Thank you for helping. This site is used by learners during training sessions, so the bar for
changes is "does this help someone find what they need faster", not "is this technically
interesting".

---

## Before you start

```bash
git clone https://github.com/portvirtuallab/sdglines.git
cd sdglines
npm install
npm run dev
```

Node 20 or later. The dev server runs at http://localhost:4321/sdglines/ — note the base path.

Worth reading first, depending on what you are changing:

- Content or data → [`docs/content-model.md`](docs/content-model.md)
- Components or styling → [`docs/design-system.md`](docs/design-system.md)
- Anything structural → [`docs/architecture.md`](docs/architecture.md)
- Anything at all → [`docs/accessibility.md`](docs/accessibility.md)

---

## Branches

| Branch           | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| `main`           | Approved and deployable. Deploys to the preview on every push. |
| `develop`        | Integration branch.                                            |
| `feature/<name>` | One feature.                                                   |
| `fix/<name>`     | One fix.                                                       |
| `content/<area>` | A content or data update.                                      |

Branch from `develop` for features and content; from `main` for an urgent fix.

---

## Commits

Conventional Commits, in English, with a body that says **why** rather than restating what the diff
shows.

| Prefix      | For                                  |
| ----------- | ------------------------------------ |
| `feat:`     | New capability                       |
| `fix:`      | A defect                             |
| `content:`  | Content or data                      |
| `docs:`     | Documentation                        |
| `test:`     | Tests                                |
| `chore:`    | Tooling, dependencies, configuration |
| `refactor:` | Behaviour unchanged                  |

```
content: confirm the Eastmed rotation and add transit times

Rotation and transit times supplied by the product owner on 2026-10-02,
replacing the proposal derived from the published ports of call.

Closes #14
```

Commit in logical stages. A single commit containing an entire feature is hard to review and
impossible to revert selectively.

---

## The checks

Everything here runs in CI, so running it locally only saves you a round trip:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run validate:content
npm test
npm run build:pages
npm run test:e2e        # needs: npx playwright install chromium
```

`npm run validate:content` is the one to remember after **any** data edit. It catches the mistakes
types cannot: a rotation calling at a port that no longer exists, a port and a route that disagree
about whether they are connected, a duplicate slug.

---

## Pull requests

Use the template. It asks for a summary, the related issue, testing done, accessibility and
responsive checks, and known limitations. Screenshots for anything visual.

Review looks for:

- **Correctness of content** above everything. An unverified value presented as fact is the most
  serious defect this project can ship.
- **Accessibility.** One `h1`, keyboard operable, contrast measured, live regions for dynamic state.
- **Nothing hard-coded into a page** that belongs in `src/data/`.
- **Comments that explain why**, particularly where the obvious approach was not taken.

---

## The rules that are not negotiable

These come from the brief and from what the site is for. A pull request that breaks one will be
asked to change regardless of how good the rest is.

1. **Never present an unverified value as fact.** If it has not been confirmed, use
   `TO_BE_CONFIRMED` and set `meta.status`.
2. **Never fabricate.** No invented customers, testimonials, volumes, emissions figures,
   certifications, frequencies, prices or capacities.
3. **Never present SDG Lines as a real carrier.** The simulation notice stays visible, and copy
   never implies a commercial offer.
4. **A map is never the only route to information.** Publish the same content as a list or a table.
5. **Every page has exactly one `h1`.**
6. **No secrets, ever**, including in a test fixture.
7. **Do not touch the live website.** Nothing in this repository changes DNS, domain configuration
   or the existing host. See [`docs/custom-domain.md`](docs/custom-domain.md).

---

## Editing content

The common cases are written out step by step in
[`docs/content-model.md`](docs/content-model.md#editing-content). In summary:

- **Adding a port:** one seed entry, plus the port id in each service rotation that calls there.
- **Adding a vessel:** one record, plus the vessel id in the service's `vesselIds`. Both directions
  are required.
- **Confirming a value:** fill it in, set `status` to `verified`, update `lastReviewed`, rewrite the
  review note, and move the item to the "Answered" section of `docs/open-questions.md`.

---

## Reporting a problem

Use an issue template, or write to **info@escolaeuropea.eu**. Two reports are especially valuable:

**A value presented as settled when it is not.** That is a defect, not a detail. Include the page
and what you believe the correct value to be.

**A barrier that stops someone completing an exercise.** Include the page, the browser and any
assistive technology.

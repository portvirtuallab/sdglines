# Content model

The type definitions are in [`src/types/content.ts`](../src/types/content.ts); the instances are in
`src/data/`. This document explains the reasoning, and is the guide for anyone editing content.

---

## The idea the model is built around

SDG Lines is a simulation, so a reader cannot tell by looking whether a number on a page is:

- a **real world fact** — the country of a port, the ISO dimensions of a container;
- a **simulation value** — a vessel's call sign, a route rotation; or
- **something nobody has confirmed**.

Those three carry very different weight, and the difference matters most in exactly the situation
the site is used in: a learner writing an assessed exercise, who has no way to tell an invented
transit time from a real one.

So every record records its own provenance, and the page shows it.

```ts
interface VerificationMeta {
  source: 'real-world' | 'legacy-site' | 'simulation-design' | 'derived';
  status: 'verified' | 'inherited' | 'needs-review';
  lastReviewed: string; // ISO 8601, YYYY-MM-DD
  reviewNote?: string; // required unless verified
}
```

### `source` — where the value came from

| Value               | Meaning                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `real-world`        | Verifiable outside the simulation: a country, a geographic position, an ISO container dimension |
| `legacy-site`       | Copied from sdglines.com during the audit of 18 September 2026                                  |
| `simulation-design` | Defined by the product owner for teaching purposes                                              |
| `derived`           | Calculated from other verified values by a documented rule                                      |

### `status` — how far it has been reviewed

| Value          | Meaning                                             | On the page                    |
| -------------- | --------------------------------------------------- | ------------------------------ |
| `verified`     | Checked against its source and approved             | Nothing shown                  |
| `inherited`    | Carried over from the legacy site, not yet reviewed | Quiet notice                   |
| `needs-review` | Missing, disputed or proposed                       | Notice saying it is a proposal |

`reviewNote` is **required** for anything not `verified`, and the integrity tests enforce it. A flag
with no explanation tells a reviewer nothing.

### The rule this exists to support

> **If a value has not been confirmed, the site says so. It is never filled in with something
> plausible.**

Unknown values render as **To be confirmed** through the `TO_BE_CONFIRMED` constant in
`src/lib/labels.ts`. One constant, so the phrase never drifts and a reader learns to recognise it.

---

## The types

### `Port` — `src/data/ports.ts`

36 records. Built from a compact `PortSeed` table and mapped, so the repeated shape is written once.

| Field                              | Source                | Notes                                                                    |
| ---------------------------------- | --------------------- | ------------------------------------------------------------------------ |
| `country`, `countryCode`, `region` | real-world            |                                                                          |
| `locode`                           | real-world            | UN/LOCODE; tested to be five characters starting with the country code   |
| `coordinates`                      | real-world            | `[latitude, longitude]`, decimal degrees. Drives the chart and the map   |
| `summary`                          | written for this site | One or two sentences of context                                          |
| `serviceIds`                       | derived               | Must agree with the rotations in `services.ts` — enforced both ways      |
| `capabilities`                     | simulation-design     | Only Barcelona's was published; the rest follow the service pattern      |
| `agency.email`                     | derived               | `city.country@sdglines.com`, the convention on the legacy Barcelona page |
| `annualThroughputTeu`              | legacy-site           | Present only for Barcelona. Absent elsewhere, not estimated              |

### `Service` — `src/data/services.ts`

5 records. These are the shipping **routes**, not the cargo services.

| Field                   | Notes                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `rotation`              | Ordered `RotationCall[]`. Numbering is sequential from 1, enforced by a test            |
| `frequency`             | `undefined` on all five. Never published on the legacy site                             |
| `transitDaysFromOrigin` | `undefined` throughout, for the same reason                                             |
| `vesselIds`             | Taken verbatim from the legacy fleet register — this _was_ published                    |
| `mapColor`              | Accent colour on charts and maps. Always paired with the service name, never used alone |

Four of five rotations are **proposals** marked `needs-review`. Gimnesias is confirmed: the legacy
page states Barcelona to Palma de Mallorca.

### `Vessel` — `src/data/vessels.ts`

14 records. Identity data is the richest content the legacy site published and is carried over
verbatim: `vesselType`, `className`, `imo`, `mmsi`, `callSign`, `yearLaunched`, `serviceId`.

`particulars` is **empty for every vessel**. Each field is optional so that an unsupplied value is
absent rather than zero, and the vessel page says so explicitly.

`namesake` describes a real historical person and is `real-world`.

### `Equipment` — `src/data/equipment.ts`

11 records. Nominal ISO 668 / ISO 1496 figures, so `real-world` and `verified`, with a note on every
record that real units vary by builder and by age.

Roll trailers are the exception: not standardised, so `simulation-design` and `needs-review`.

### `CargoService` — `src/data/cargoServices.ts`

6 records. What SDG Lines **carries**, as opposed to where it sails. Each maps to one
`CargoCapability`, which is how a cargo service finds the routes and ports that accept it.

### `ArrivalCharge` — `src/data/arrivalCharges.ts`

11 records. What each charge covers, what it is calculated on, who settles it, and what learners
most often get wrong about it. **No amounts**, for the reasons in
[`open-questions.md`](open-questions.md) §3.

### `ProsePage` — `src/data/pages.ts`

The explanatory pages, held as data so that twelve near-identical Astro files are not maintained
separately and cannot drift apart visually. Five block types: `paragraph`, `heading`, `list`,
`callout`, `definitions`, `links`.

---

## Editing content

### Adding a port

1. Add a `PortSeed` entry in `src/data/ports.ts` with country, region, LOCODE, coordinates, a
   summary, the services calling there and its capabilities.
2. Add the port id to the `rotation` of each service that calls there, in
   `src/data/services.ts`, at the correct position — and renumber the rotation, which is
   sequential.
3. `npm run validate:content`

The port page, the directory, the chart, the map, the search index and the sitemap all follow. No
component is edited.

### Adding a vessel

1. Add a record in `src/data/vessels.ts` with a unique id, IMO, MMSI and call sign.
2. Set `serviceId`, and add the vessel id to that service's `vesselIds`. Both directions are
   required; the tests enforce it.
3. Write the namesake biography — two to four sentences, from public biographical record.
4. Leave `particulars` empty unless the product owner has supplied the figures.
5. `npm run validate:content`

### Confirming a value

When the product owner confirms something:

1. Fill in the value.
2. Set `meta.status` to `verified`.
3. Update `meta.lastReviewed` to today.
4. Remove or rewrite `meta.reviewNote`.
5. Move the item to the "Answered" section of `open-questions.md`, with the date and the decision.
6. `npm run validate:content`

### Before committing any content change

```bash
npm run validate:content && npm run typecheck && npm run build:pages
```

---

## Ready for translation, not translated

The model is shaped so a locale can be added without restructuring: slugs are ASCII and stable,
every display string is in a data file or a component prop, and `SITE.locale` drives the `lang`
attribute.

Nothing is half-translated, which the brief requires. See
[`architecture.md`](architecture.md#internationalisation) for the order the work has to happen in.

# URL migration

Every address published by the previous sdglines.com, what happened to it and why.

**Source:** the legacy `sitemap.xml`, captured 18 September 2026 — 84 distinct addresses.

|                             |       |
| --------------------------- | ----- |
| Redirected to a new address | 80    |
| Kept at the same address    | 4     |
| **Not covered**             | **0** |

The redirect map lives in [`redirects.mjs`](../redirects.mjs) and is applied in
`astro.config.mjs`. Coverage is re-checked whenever the map changes.

---

## How the redirects work

GitHub Pages serves static files and cannot issue an HTTP 301. Astro therefore builds a small HTML
page for each legacy address containing a meta refresh, a `noindex` directive and a canonical link
to the destination.

**What this costs.** A meta refresh is slower than a server redirect and search engines treat it as
a weaker signal than a 301. Ranking for the old addresses will transfer more slowly than it would
with a real redirect.

**Why it is still right.** The alternative is breaking every bookmark, course handout and
learning-platform link that points at the old site. For a site used by learners following links
their trainer gave them, that is the more expensive failure. If the domain later moves to a host
that can issue 301s, the same map can be translated directly into server rules.

**A note for the custom domain move.** Redirect destinations are prefixed with the deployment base
path at build time. On the GitHub Pages preview `/pireaus` points at `/sdglines/ports/piraeus`; with
`BASE_PATH=/` it will point at `/ports/piraeus`. This is handled in `astro.config.mjs` and needs no
manual edit.

---

## Decisions by category

### Routes (5 addresses)

The five services moved under `/routes/`, and `/Optimed` lost its capital letter.

Each destination page is substantially new content: the legacy pages published no rotation, no
frequency and no transit time. See [`audit.md`](audit.md) §3.1.

### Vessels (16 addresses)

Each vessel moved from a top-level address to `/fleet/<slug>`. Both fleet index addresses
(`/thefleet` and `/the-fleet`) point at `/fleet`.

Three slugs changed because the name was wrong rather than because the structure changed:

- `/carolina` → `/fleet/caroline-herschel`
- `/teano` → `/fleet/theano-of-crotone`
- `/halide-edib-adıvar` → `/fleet/halide-edib-adivar` (the legacy slug contained a dotless ı, which
  is valid but unreliable in links pasted between systems)

### Ports (37 addresses)

All 36 ports moved to `/ports/<slug>`, plus the index. The legacy addresses were inconsistent — some
bare (`/barcelona`), some prefixed (`/port-of-antwerp`) — and six were misspelled. Each redirect
points at the corrected slug.

Two addresses were malformed in the legacy content management system and never resolved:

- `/https-//sdglines-com/port-of-oran` → `/ports/oran`
- `/https-//sdglines-com/port-of-nouakchott` → `/ports/nouakchott`

They are redirected anyway because they appear in the legacy sitemap and therefore in search engine
indexes.

The ports index was published at `/página-en-blanco-calls` — a content management default meaning
"blank page" in Spanish. It redirects to `/ports`.

### Equipment and cargo (8 addresses)

Equipment moved under `/equipment/`. Cold Chain and Dangerous Goods moved to `/services/`, because
they describe _what is carried_ rather than _what it travels in_. Both packing pages
(`/container-packing` and `/how-to-pack-a-container`) merge into `/equipment/packing`, which was one
subject split across two pages.

### Agencies (3 addresses)

`/agency`, `/agencies` and `/OwnersRepresentatives` were three pages on one subject, none of which
listed an agency. All three redirect to `/ports/agencies`, which lists all 36 offices grouped by
region.

### Corporate and about (4 addresses)

`/environment` and `/sustainability` covered the same subject and merge into
`/about/sustainability`. `/digitalization` becomes `/about/digitalisation` — British spelling, to
match the rest of the site.

### News (4 addresses)

The three articles are dated October 2020 and describe Escola Europea activities rather than the
simulation. They are **archived, not migrated**: their addresses redirect to `/resources/news`,
which now records changes to the simulation itself.

### Not migrated (1 address)

`/securing-air-cargo` is an air cargo article published on the shipping line site. It belongs to SDG
Airlines. Its address redirects to `/resources` rather than being given a home here.

---

## Addresses kept unchanged

| Address      | Note                                                                  |
| ------------ | --------------------------------------------------------------------- |
| `/about`     | Same address, completely rewritten. See [`audit.md`](audit.md) §3.6.  |
| `/services`  | Same address, now meaning cargo services rather than shipping routes. |
| `/equipment` | Same address, now a comparison table rather than a list of links.     |
| `/resources` | Same address, reorganised.                                            |

---

## Verifying a redirect

After a build:

```bash
npm run build:pages
grep -o 'url=[^"]*' dist/pireaus/index.html
# url=/sdglines/ports/piraeus
```

After deployment, spot-check a sample across categories rather than all eighty:

```
/eastmed            → /routes/eastmed
/pireaus            → /ports/piraeus
/carolina           → /fleet/caroline-herschel
/arrival-charges    → /resources/arrival-charges
/página-en-blanco-calls → /ports
```

---

## Full table

Destination paths are shown site-relative; the deployment base path is added at build time.

| Legacy address                                                                      | New address                   | Action             |
| ----------------------------------------------------------------------------------- | ----------------------------- | ------------------ |
| `/agencies`                                                                         | `/ports/agencies`             | Redirect           |
| `/agency`                                                                           | `/ports/agencies`             | Redirect           |
| `/aglaonike`                                                                        | `/fleet/aglaonike`            | Redirect           |
| `/aqaba`                                                                            | `/ports/aqaba`                | Redirect           |
| `/arrival-charges`                                                                  | `/resources/arrival-charges`  | Redirect           |
| `/barcelona`                                                                        | `/ports/barcelona`            | Redirect           |
| `/beirut`                                                                           | `/ports/beirut`               | Redirect           |
| `/carolina`                                                                         | `/fleet/caroline-herschel`    | Redirect           |
| `/civitavecchia`                                                                    | `/ports/civitavecchia`        | Redirect           |
| `/ColdChain`                                                                        | `/services/cold-chain`        | Redirect           |
| `/container-packing`                                                                | `/equipment/packing`          | Redirect           |
| `/containers`                                                                       | `/equipment/containers`       | Redirect           |
| `/CustomerService`                                                                  | `/resources/customer-service` | Redirect           |
| `/dangerous-goods`                                                                  | `/services/dangerous-goods`   | Redirect           |
| `/danietta`                                                                         | `/ports/damietta`             | Redirect           |
| `/digitalization`                                                                   | `/about/digitalisation`       | Redirect           |
| `/dorothy-hodgkin`                                                                  | `/fleet/dorothy-hodgkin`      | Redirect           |
| `/eastmed`                                                                          | `/routes/eastmed`             | Redirect           |
| `/environment`                                                                      | `/about/sustainability`       | Redirect           |
| `/escola-europea-technical-courses`                                                 | `/resources/news`             | Redirect           |
| `/eurasia`                                                                          | `/routes/eurasia`             | Redirect           |
| `/flat-racks`                                                                       | `/equipment/flat-racks`       | Redirect           |
| `/Frances-Allen`                                                                    | `/fleet/frances-allen`        | Redirect           |
| `/genoa`                                                                            | `/ports/genoa`                | Redirect           |
| `/gerty-cori`                                                                       | `/fleet/gerty-cori`           | Redirect           |
| `/gimnesias`                                                                        | `/routes/gimnesias`           | Redirect           |
| `/hagnodice`                                                                        | `/fleet/hagnodice`            | Redirect           |
| `/halide-edib-adıvar`                                                               | `/fleet/halide-edib-adivar`   | Redirect           |
| `/how-to-pack-a-container`                                                          | `/equipment/packing`          | Redirect           |
| `/https-//sdglines-com/port-of-nouakchott`                                          | `/ports/nouakchott`           | Redirect           |
| `/https-//sdglines-com/port-of-oran`                                                | `/ports/oran`                 | Redirect           |
| `/izmir`                                                                            | `/ports/izmir`                | Redirect           |
| `/maria-goeppert-mayer`                                                             | `/fleet/maria-goeppert-mayer` | Redirect           |
| `/marseille`                                                                        | `/ports/marseille`            | Redirect           |
| `/merce-rodoreda`                                                                   | `/fleet/merce-rodoreda`       | Redirect           |
| `/misurata`                                                                         | `/ports/misurata`             | Redirect           |
| `/nawal-el-saadawi`                                                                 | `/fleet/nawal-el-saadawi`     | Redirect           |
| `/news`                                                                             | `/resources/news`             | Redirect           |
| `/Optimed`                                                                          | `/routes/optimed`             | Redirect           |
| `/OwnersRepresentatives`                                                            | `/ports/agencies`             | Redirect           |
| `/página-en-blanco-calls`                                                           | `/ports`                      | Redirect           |
| `/pireaus`                                                                          | `/ports/piraeus`              | Redirect           |
| `/port-of-abu-dahbi`                                                                | `/ports/abu-dhabi`            | Redirect           |
| `/port-of-algier`                                                                   | `/ports/algiers`              | Redirect           |
| `/port-of-antwerp`                                                                  | `/ports/antwerp`              | Redirect           |
| `/port-of-bar`                                                                      | `/ports/bar`                  | Redirect           |
| `/port-of-bari`                                                                     | `/ports/bari`                 | Redirect           |
| `/port-of-busan`                                                                    | `/ports/busan`                | Redirect           |
| `/port-of-casablanca`                                                               | `/ports/casablanca`           | Redirect           |
| `/port-of-durres`                                                                   | `/ports/durres`               | Redirect           |
| `/port-of-felixtowe`                                                                | `/ports/felixstowe`           | Redirect           |
| `/port-of-hamburg`                                                                  | `/ports/hamburg`              | Redirect           |
| `/port-of-jeddah`                                                                   | `/ports/jeddah`               | Redirect           |
| `/port-of-las-palmas`                                                               | `/ports/las-palmas`           | Redirect           |
| `/port-of-le-havre`                                                                 | `/ports/le-havre`             | Redirect           |
| `/port-of-lisbon`                                                                   | `/ports/lisbon`               | Redirect           |
| `/port-of-mumbai`                                                                   | `/ports/mumbai`               | Redirect           |
| `/port-of-palermo`                                                                  | `/ports/palermo`              | Redirect           |
| `/port-of-palma-de-mallorca`                                                        | `/ports/palma-de-mallorca`    | Redirect           |
| `/port-of-rotterdam`                                                                | `/ports/rotterdam`            | Redirect           |
| `/port-of-salalah`                                                                  | `/ports/salalah`              | Redirect           |
| `/port-of-tanger-med`                                                               | `/ports/tanger-med`           | Redirect           |
| `/port-said`                                                                        | `/ports/port-said`            | Redirect           |
| `/quality`                                                                          | `/about/quality`              | Redirect           |
| `/quotation`                                                                        | `/quote`                      | Redirect           |
| `/rades-la-goulette`                                                                | `/ports/rades-la-goulette`    | Redirect           |
| `/rita-levi-montalcini`                                                             | `/fleet/rita-levi-montalcini` | Redirect           |
| `/roll-trailers`                                                                    | `/equipment/roll-trailers`    | Redirect           |
| `/rosa-sensat`                                                                      | `/fleet/rosa-sensat`          | Redirect           |
| `/sappho`                                                                           | `/fleet/sappho`               | Redirect           |
| `/securing-air-cargo`                                                               | `/resources`                  | Redirect           |
| `/shippings-main-challenge-is-to-use-the-massive-introduction-of-the-digital-tools` | `/resources/news`             | Redirect           |
| `/sustainability`                                                                   | `/about/sustainability`       | Redirect           |
| `/teano`                                                                            | `/fleet/theano-of-crotone`    | Redirect           |
| `/the-fleet`                                                                        | `/fleet`                      | Redirect           |
| `/thefleet`                                                                         | `/fleet`                      | Redirect           |
| `/valencia`                                                                         | `/ports/valencia`             | Redirect           |
| `/valleta`                                                                          | `/ports/valletta`             | Redirect           |
| `/westmed`                                                                          | `/routes/westmed`             | Redirect           |
| `/yep-med-project-employment-opportunities-for-the-mediterranean-youth`             | `/resources/news`             | Redirect           |
| `/about`                                                                            | `/about`                      | Keep, rewritten    |
| `/equipment`                                                                        | `/equipment`                  | Keep, restructured |
| `/resources`                                                                        | `/resources`                  | Keep, reorganised  |
| `/services`                                                                         | `/services`                   | Keep, redefined    |

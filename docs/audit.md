# Audit of the previous sdglines.com

**Date of audit:** 18 September 2026
**Method:** sitemap crawl (`/sitemap.xml`, 85 addresses), page-by-page content extraction, and
manual inspection in a browser of the pages whose content is rendered client-side.

The previous site was built on Wix. A substantial part of its content is rendered by JavaScript, so
findings below distinguish between what is in the HTML and what only appears once scripts run.

---

## 1. Summary

The previous website contained genuinely valuable material — a complete fleet register, 36 ports of
call, five named services, and a clear statement of its educational purpose. That material was
buried under an information architecture that made it hard to reach, and surrounded by content that
undermined it.

The redesign keeps the material and replaces everything around it.

**Counted findings**

|                                               |         |
| --------------------------------------------- | ------- |
| Addresses in the sitemap                      | 85      |
| Items in the primary navigation               | 70+     |
| Ports listed individually in the navigation   | 36      |
| Vessels listed individually in the navigation | 14      |
| Malformed addresses                           | 2       |
| Misspelled port names                         | 6       |
| Misspelled or inconsistent vessel names       | 2       |
| Route pages with no rotation published        | 4 of 5  |
| Vessels with technical particulars published  | 0 of 14 |
| Fabricated customer testimonials              | 3       |
| News articles, all dated October 2020         | 3       |

---

## 2. Information architecture

### 2.1 The navigation contained the whole site

Every one of the 36 ports and all 14 vessels appeared as individual items in the primary navigation,
producing a menu of more than seventy entries. The navigation was not a way to find things; it was
the site, flattened.

**Consequence.** Finding the Tunisian call meant reading a list of 36 port names. There was no
search, no filter and no grouping by country or region.

**Resolved by.** Seven primary sections, with searchable directories behind them. The full port list
is at `/ports` with filters by region, service and free text; the fleet is at `/fleet` with a
register.

### 2.2 Routes and cargo types were mixed together

"Services" in the navigation meant the five shipping routes. Cold Chain, Dangerous Goods, Container
& Trailer Packing and Equipment sat beside it as separate top-level items. A learner asking "can I
ship reefer cargo to Beirut" had to know to look in two unrelated places.

**Resolved by.** **Routes** answers _where_; **Services** answers _what_. Each links to the other,
so either question reaches the same answer.

### 2.3 A page named "blank page"

The ports of call index was published at `/página-en-blanco-calls` — Spanish for "blank page", a
content management system default that was never changed. It is the address every port link pointed
through.

**Resolved by.** `/ports`, redirected from the old address.

---

## 3. Content

### 3.1 Route pages published no operational information

This is the most serious content finding. Four of the five route pages — Eastmed, EurAsia, Optimed
and Westmed — carried a symbolic photograph (a bird, a horse) and one paragraph of generic company
copy. None published:

- a port rotation
- a direction
- a frequency
- a transit time
- the vessels deployed

The single exception is Gimnesias, which states that it connects Barcelona and Palma de Mallorca.

**Consequence.** The pages were unusable as an operational reference, which is the primary purpose
of the site.

**Resolved by.** Each route page now publishes a full rotation as an ordered table, the vessels
deployed on it (taken from the fleet register, which does record the assignment) and the cargo
accepted. Because no rotation was ever published, the rotations are **proposals derived from the
published ports of call and their geography**, marked `needs-review` and labelled as such on the
page. Frequencies and transit times are left as _To be confirmed_ rather than invented.

### 3.2 Arrival Charges redirected to the home page

The Arrival Charges link — one of the primary operational tools, and a persistent utility action in
the brief — redirects to the home page. No charge schedule is published anywhere on the site.

**Resolved by.** `/resources/arrival-charges` publishes a catalogue of eleven charge types: what
each covers, what it is calculated on, who settles it, and what learners most often get wrong about
it. **No amounts are published**, because none exist to migrate and inventing a tariff would be
worse than publishing none: a learner would quote it in an assessed exercise.

### 3.3 The fleet register was the best content on the site

The fleet table published, for all fourteen vessels: vessel type, class, MMSI, IMO, year launched,
call sign and assigned service. It is complete, internally consistent and genuinely useful.

It was reachable only through a hover menu, one vessel per menu item.

**Preserved in full** at `/fleet`, as cards and as a register table, with every identifier carried
over verbatim.

**But:** no technical particulars — length, beam, draught, capacity, speed — are published for any
vessel, and the "Vessel's technical data sheet" link led to a page that does not contain them. Those
fields are modelled as optional and left empty; the vessel pages say so explicitly rather than
estimating.

### 3.4 Fabricated customer testimonials

Three testimonials were published under a heading "What our clients say", attributed to named
individuals ("Sarina K.", "Mohamed C.", "Fouzi A."), praising the reliability, pricing and emissions
performance of a company that carries no cargo.

**Consequence.** This is the most serious editorial problem on the site. Presented without
qualification, they read as genuine social proof for a carrier that does not exist.

**Resolved by.** Removed entirely, and not replaced. The brief permits retaining them if clearly
labelled as part of a simulation scenario; they were removed instead, because a testimonial that has
to be labelled as fictional does no persuasive work and carries the residual risk that the label is
missed.

### 3.5 Unverifiable claims in the hero

The home page opened with three rotating slogans and no heading:

- "TRACK AND TRACE ON ALL SERVICES!"
- "WE MAKE SUSTAINABLE TRANSPORT EASY"
- "DELIVERY AND LOW EMISSIONS ALWAYS GUARANTEED"

Track and trace is not available on the site. "Delivery and low emissions always guaranteed" is a
commercial guarantee from an entity that cannot deliver anything.

**Resolved by.** A single `h1` stating what the site is, supporting copy stating what a visitor can
do, and the simulation notice immediately beneath the header on every page.

### 3.6 The About page was about something else

The About page described Escola Europea: its founding in 2006, its methodology, its director, its
course catalogue and its alumni numbers. SDG Lines was mentioned in two sentences at the end.

**Resolved by.** `/about` is about SDG Lines: what it is, what it is not, how it is used and how
accurate its data is. Escola Europea and Port Virtual Lab are explained in terms of their
relationship to it, each with its own page.

### 3.7 Stale and misplaced content

- The three news articles are dated 25 October 2020 and describe Escola Europea activities rather
  than the simulation. By 2026 the section mainly demonstrated that nobody was maintaining it.
- `/securing-air-cargo` is an air cargo article published on the shipping line site. It belongs to
  SDG Airlines.

**Resolved by.** `/resources/news` records changes to the _simulation_, which is what a trainer
actually needs to know. The legacy article addresses redirect there. The air cargo article is not
migrated.

---

## 4. Spelling and naming

Corrected, each recorded in the data with a review note so the product owner can confirm or reject
the change.

### Ports

| Legacy            | Corrected  | Note                                               |
| ----------------- | ---------- | -------------------------------------------------- |
| Port of Pireaus   | Piraeus    |                                                    |
| Port of Valleta   | Valletta   |                                                    |
| Port of Felixtowe | Felixstowe |                                                    |
| Port of Abu Dahbi | Abu Dhabi  |                                                    |
| Port of Algier    | Algiers    | English form                                       |
| `/danietta`       | Damietta   |                                                    |
| Port of Durres    | Durrës     | Diacritic restored in display, slug stays `durres` |

### Vessels

| Legacy            | Corrected         | Note                                                         |
| ----------------- | ----------------- | ------------------------------------------------------------ |
| Carolina Herschel | Caroline Herschel | The astronomer is Caroline Herschel                          |
| Merce Rodoreda    | Mercè Rodoreda    | Catalan spelling                                             |
| `/teano`          | Theano of Crotone | The fleet table already read "Theano"; only the URL differed |

### Also flagged, not changed

- Four vessels are recorded with the class name **"Reffles"**, which is very likely a misspelling of
  **"Raffles"**. Left as published and flagged, because unlike a person's name it cannot be verified
  against an external source.
- The **Gimnesias** service has **no vessel assigned** in the fleet register. The service page says
  so rather than leaving the section empty.
- **Rosa Sensat** is recorded with the service "Pilot" rather than a commercial service. Treated as
  a pilot vessel not assigned to a published rotation.

---

## 5. Technical

| Finding                               | Detail                                                                                                                          | Resolved by                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| No text content in the home page body | Extraction returned only navigation and footer; the body is images                                                              | Semantic HTML throughout; every page is readable as text                             |
| No `h1` on most pages                 | Including the home page                                                                                                         | Exactly one `h1` per page, enforced by a test on every template                      |
| Two malformed addresses               | `/https-//sdglines-com/port-of-oran` and `/https-//sdglines-com/port-of-nouakchott`, both in the sitemap                        | Redirected to the correct port pages                                                 |
| No search                             | 36 ports and 14 vessels with no way to search                                                                                   | Site-wide search over ports, routes, vessels, equipment, services, charges and pages |
| Inconsistent URL patterns             | Some ports bare (`/barcelona`), some prefixed (`/port-of-antwerp`), mixed casing (`/Optimed`, `/ColdChain`, `/CustomerService`) | One pattern: lowercase, hyphenated, grouped by section                               |
| Client-side rendering                 | Most content requires JavaScript                                                                                                | Static HTML; the port directory and every table work with scripts disabled           |
| Mixed-language artefacts              | `/página-en-blanco-calls` on an English site                                                                                    | English throughout                                                                   |

---

## 6. What was deliberately not migrated

Each with its reason, as the brief requires decisions to be documented rather than silent:

| Content                               | Decision                      | Reason                                                                  |
| ------------------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| Three customer testimonials           | **Remove**                    | Fabricated social proof for a company that carries no cargo             |
| Three news articles from October 2020 | **Archive**                   | Describe Escola Europea activities, not the simulation; six years stale |
| `/securing-air-cargo`                 | **Remove**                    | Air cargo content on a shipping line site; belongs to SDG Airlines      |
| Hero slogans                          | **Replace**                   | Unverifiable commercial guarantees                                      |
| About page body                       | **Rewrite**                   | Described Escola Europea rather than SDG Lines                          |
| "Environment" page                    | **Merge** into Sustainability | Two pages covering one subject                                          |
| Symbolic route photographs            | **Remove**                    | A bird and a horse in place of a rotation                               |

---

## 7. What the product owner still needs to supply

Listed in full with context in [`open-questions.md`](open-questions.md). In order of how much they
limit the site:

1. **Service frequencies and transit times** — currently _To be confirmed_ on all five services.
2. **Confirmation of the five proposed rotations.**
3. **Arrival charge amounts**, with currency and validity dates.
4. **Technical particulars for the fourteen vessels.**
5. **Confirmation of the vessel class name "Reffles"/"Raffles".**
6. **A vessel assignment for the Gimnesias service**, or confirmation that a partner operates it.
7. **Confirmation of the two corrected vessel names.**

# Open questions for the product owner

Everything the site currently cannot state because nobody has confirmed it.

Each item says what is missing, what the site does in the meantime, and what changes when the answer
arrives. They are ordered by how much they limit the site's usefulness during a training exercise.

**How to answer:** reply against the item numbers, or open an issue using the
`content-verification` template. Once a value is confirmed, edit the relevant file in `src/data/`,
set `meta.status` to `verified`, update `meta.lastReviewed`, and run `npm run validate:content`.

---

## 1. Service frequencies and transit times

**Status:** absent for all five services.

**Why it is first:** transit time is the single figure a learner most often needs, and the one an
exercise comparing routings turns on. Without it, a route page cannot answer the question it exists
to answer.

**Currently:** every frequency and transit time renders as _To be confirmed_. Nothing is estimated.

**Needed:** for each of Westmed, Eastmed, Optimed, EurAsia and Gimnesias — the sailing frequency
(for example "weekly, departing Barcelona on Tuesdays") and the transit time in days from the first
port of the rotation to each subsequent call.

**File:** `src/data/services.ts` — `frequency` on the service, `transitDaysFromOrigin` on each
rotation call.

---

## 2. Confirmation of the five route rotations

**Status:** proposed, not confirmed.

**Background:** the legacy route pages published no rotation at all. The rotations on the site are
derived from the published ports of call and their geography. Gimnesias is the exception: Barcelona
to Palma de Mallorca is stated on the legacy page and is treated as confirmed.

**Currently:** each route page carries a notice saying the rotation awaits confirmation.

**Needed:** confirmation, correction, or a statement that the proposed rotation should be adopted as
the simulation's definition.

**File:** `src/data/services.ts` — the `rotation` array, and `meta.status`.

---

## 3. Arrival charge amounts

**Status:** no amounts published, because none exist to migrate — the legacy Arrival Charges link
redirects to the home page.

**Currently:** eleven charge types are documented — what each covers, what it is calculated on, who
pays it — with no figures. The page states that the tariff is set by the trainer per exercise.

**Needed, if amounts are to be published:** for each charge, the amount, the currency, the validity
dates, and whether it varies by port.

**Worth deciding rather than assuming:** whether amounts _should_ be published centrally at all.
Leaving the tariff to the trainer mirrors how a real tariff works — negotiated and dated, not a
fixed property of a port — and avoids the risk of a stale figure being quoted as current. Publishing
them makes the site more self-sufficient during an exercise. This is a pedagogical decision, not a
technical one.

**File:** `src/data/arrivalCharges.ts` — an `amount` field would be added to `ArrivalCharge`; the
tables will carry it with no other change.

---

## 4. Technical particulars for the fourteen vessels

**Status:** absent for all fourteen. The legacy site published none, and its "technical data sheet"
link did not lead to them.

**Currently:** each vessel page states plainly that no particulars have been published, rather than
showing an empty table or an estimate.

**Needed, per vessel:** length overall, beam, draught, deadweight, TEU capacity and/or lane metres
as appropriate to the type, service speed, reefer plugs.

**Note:** these can be plausible simulation values rather than real vessel data — they simply have
to be _decided_ rather than _guessed by the website_. Once decided they are facts about the
simulation and can be published as such.

**File:** `src/data/vessels.ts` — the `particulars` object; set `meta.status` to `verified` when
supplied.

---

## 5. The vessel class name "Reffles"

**Status:** four vessels are recorded with the class "Reffles" — Frances Allen, Halide Edib Adıvar,
Mercè Rodoreda, Nawal El Saadawi and Sappho.

**Suspicion:** a misspelling of "Raffles".

**Currently:** published as recorded, flagged for review. Unlike a person's name it cannot be
checked against an external source, so it was not corrected unilaterally.

**Needed:** confirmation of the intended spelling.

**File:** `src/data/vessels.ts` — `className`.

---

## 6. Gimnesias has no vessel

**Status:** the legacy fleet register assigns no vessel to the Gimnesias service.

**Currently:** the route page says so explicitly and links to the fleet, rather than showing an
empty section.

**Needed:** either assign a vessel, or confirm that the service is operated by a partner and should
be described that way.

**Files:** `src/data/services.ts` (`vesselIds`) and `src/data/vessels.ts` (`serviceId`). The
integrity tests enforce that the two agree.

---

## 7. Two corrected vessel names

**Status:** corrected on the site, pending confirmation.

| Legacy            | Now                   | Reason                              |
| ----------------- | --------------------- | ----------------------------------- |
| Carolina Herschel | **Caroline Herschel** | The astronomer is Caroline Herschel |
| Merce Rodoreda    | **Mercè Rodoreda**    | Catalan spelling                    |

**Needed:** confirmation, or instruction to restore the legacy spelling.

**File:** `src/data/vessels.ts`.

---

## 8. Rosa Sensat as a pilot vessel

**Status:** recorded in the legacy register with the service "Pilot" rather than a commercial
service. She is the fleet's autonomous electric vessel.

**Currently:** treated as a pilot vessel not assigned to a published rotation, and the page explains
that she exists in the simulation to support exercises about future propulsion and crewless
operation.

**Needed:** confirmation that this reading is correct, and any further detail about her role.

**File:** `src/data/vessels.ts`.

---

## 9. Port capabilities beyond Barcelona

**Status:** the legacy site published a cargo capability list only for Barcelona.

**Currently:** capabilities for the other 35 ports are assigned by service pattern — a port on a
Ro-Ro service handles Ro-Ro, a hub handles the full set. This is reasonable but not authoritative.

**Needed:** confirmation, or a per-port list where it matters to an exercise.

**File:** `src/data/ports.ts` — `capabilities`.

---

## 10. Downloadable data sheets

**Status:** none published. The legacy files could not be recovered during the audit.

**Depends on:** item 4. Once vessel particulars exist, data sheets can be generated from the same
data rather than maintained separately, so they cannot drift from the website.

---

## Answered items

None yet. As items are resolved, move them here with the date and the decision, so that the
reasoning survives the person who made it.

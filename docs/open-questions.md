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

## The quotation tool

These arrived with the two operational workbooks on 22 September 2026. They are separate from the
items above because they block a price rather than a page, and a wrong price is worse than a missing
one. Background: `docs/quote/workbook-audit.md` and `docs/quote/pricing-model.md`.

---

## 12. The sea freight formula

**Status:** lost, reconstructed from results.

The workbooks were exported from Google Sheets and every formula came through as
`__xludf.DUMMYFUNCTION("COMPUTED_VALUE")`. Only the cached results survived.

The sea freight base is demonstrably a pure function of the direct distance — verified across 405
quotations and 36 distinct distances, with no exceptions — but the function itself is gone. No
closed form reproduces it: linear, quadratic, logarithmic, power and square-root fits all miss the
middle of the range by 15 to 20 EUR.

**Currently:** interpolated between the 36 recovered anchor points. Exact at every distance the
workbook ever quoted, approximate between them.

**Needed:** access to the original Google Sheet, where the formula is still readable. That would
replace the interpolation with the real rule and settle item 13 at the same time.

---

## 13. An unexplained 20 EUR in the emissions surcharge

**Status:** unresolved.

The workbook adds a flat 20 EUR to the ETS surcharge of 180 of its 202 worked quotations and omits
it from the other 22. Nothing separates the two groups: not the quantity, the port class, the
equipment, the distance or the route. The rest of the surcharge is exact — 73.5899 EUR per tonne
reproduces all 202.

**Currently:** always added, because most published quotations carry it. Those 22 totals therefore
come out 20 EUR high, and the test suite pins that count so the exception cannot quietly grow.

---

## 15. Two distances disagree with themselves

**Status:** needs correction in the workbook.

`GENERAL!Distance NM` is not symmetric in two places: Barcelona to Oran reads 279 NM one way and
362 NM the other, and Jeddah to Abu Dhabi reads 2 452 NM against 2 542 NM. Since the price is driven
by this matrix, the direction a learner quotes in currently changes what they pay.

**Currently:** the first value found is used, and the discrepancy is reported by every import.

**Needed:** the correct figure for each pair.

---

## 16. Dangerous goods from a class A or B port

**Status:** unknown.

The IMO surcharge is 65 EUR per unit from a class C port and 70 EUR from class D. No worked
quotation ever carried dangerous goods from a class A or B port, so those two rates were never
published.

**Currently:** a quotation declaring dangerous goods from Antwerp, Rotterdam or another class A or B
port shows the charge as unresolved rather than guessing it.

---

## 17. Transit times are in the workbook after all

**Status:** item 1 above is partly answered, and nothing has been done about it.

Item 1 records that no transit time is published for any service. That was true of the legacy
website. It is not true of `GENERAL!SERVICES`, which gives the sailing time and the time alongside
for all 57 legs of the five rotations — which is exactly what the quotation tool now quotes transit
times from.

**Currently:** the route pages still render _To be confirmed_ while the quotation tool states a
transit time for the same voyage. That is inconsistent, and a learner will notice.

**Needed:** confirmation that these are the intended times, after which `src/data/services.ts` can
be filled from the same import. The sailing **frequency** asked for in item 1 is genuinely absent
and still needed.

---

## 18. The 45-foot roll trailer is recorded as 6.096 linear metres

**Status:** needs correction in the workbook.

`BOOKINGS!Tariffs` gives the 45-foot roll trailer 6.096 linear metres. That is the length of a
twenty-foot unit; 45 feet is 13.716 m, which is what the 45-foot flatrack and the 45-foot high cube
both carry.

The figure is not cosmetic. The freight rate is derived from linear metres, and so is the TEU
equivalent the quotation prices by, so the unit is currently quoted as though it occupied a single
twenty-foot slot. It shows up immediately in the comparison table on any quotation: it sorts last
by price per TEU, well behind equipment of the same length.

**Currently:** imported as the workbook states it, and reported by every import run.

**Needed:** confirmation that 13.716 m is intended, after which the workbook cell is the only thing
that has to change.

---

## Answered items

### 11. Four arithmetic defects in the live quotation spreadsheet

**Answered 2026-09-23.** Fix them.

The sea freight was charged once however many containers were booked, the port additional grew with
the square of the quantity, the emissions ignored the quantity, and the equipment factor was
computed into a column the total then discarded.

The decision was that the freight and every cargo-handling charge must follow the number of
containers. All four are fixed in `corrected` rules, which is what the site charges. The
spreadsheet's own arithmetic survives as `legacy` rules, used only by the regression suite, so the
202 historical quotations still prove the tariff tables were read correctly.

Twenty 20' reefers Barcelona to Damietta moved from 34 800.63 to 35 647.62 EUR. The totals differ by
2 %; the composition does not resemble itself at all, because two of the faults were large and
pulled in opposite directions. Section 9 of `docs/quote/pricing-model.md` has the comparison.

**Two consequences to confirm:** the reefer plug-in and the bunker recovery are now charged per
container too, since both follow the container in practice, where the workbook charged them once.

### 14. Palma has no freight rate

**Answered 2026-09-23.** Supplied: class D, base index 100.

Class D because 457 449 TEU sits inside the band every other class D port occupies (82 000 to
750 000), and the next class up starts at 1 053 000. Base index 100 because that is the index the
workbook gives every other Spanish port - Barcelona, Valencia and Las Palmas are all 100 - and Palma
is a short-sea shuttle from Barcelona.

Both are declared in `OWNER_SUPPLIED` in `scripts/workbook/import.mjs`, emitted with
`source: 'simulation-design'` and `status: 'needs-review'`, so they stay distinguishable from
values the workbook states. Palma is now offered as an origin.

### The Port Virtual Lab PIN check

**Answered 2026-09-23.** Removed.

The build shipped PBKDF2 digests of the 34 codes and hashed the entered code against them over
600 000 rounds. A four-digit code has ten thousand possible values, so any check running in the
browser can be defeated by trying all of them; the slow hash turned a sweep of seconds into one of
hours, which is a speed bump rather than a control, and one that looked like a control.

The field remains, validated for format and printed on the quotation as an activity reference. The
codes are still never committed. `docs/quote/pin-validation.md` records what it would take to check
them properly.

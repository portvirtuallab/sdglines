# The SDG Lines quotation model

Reverse-engineered from the supplied workbooks on 2026-09-22 and validated
against 202 worked quotations in `BOOKINGS!Studio`. Corrected on 2026-09-23 on
the product owner's instruction; see section 9.

The Google Sheets formulas did not survive the `.xlsx` export - every computed
cell reads `__xludf.DUMMYFUNCTION("COMPUTED_VALUE")` and only the cached result
remains. Everything below was therefore derived from the cached results and the
tariff tables, and each rule records how many of those cases it reproduces.

## 1. Two sets of rules

`src/lib/quote/pricing.ts` implements both.

| Rules | Used by | What it is |
| --- | --- | --- |
| `corrected` | the website | What SDG Lines charges. The four arithmetic faults below are fixed |
| `legacy` | the test suite only | The live spreadsheet's own arithmetic, faults included |

`legacy` is not dead code. It is the only evidence that the reverse-engineering
was right: it replays all 202 historical quotations and reproduces every charge
to the cent. The tariff tables, the freight curve and the surcharge lookups are
shared by both sets of rules, so if `legacy` stops reproducing history, nothing
built on those tables can be trusted either. Delete it and that check goes.

## 2. Inputs the price depends on

| Input | Where it comes from |
| --- | --- |
| `distanceNm` | `GENERAL!Distance NM`, the **direct** origin-destination cell |
| `equipment` | one of the 16 types in `BOOKINGS!Tariffs` |
| `portClass` | `CLASS` (A-D) of the **port of origin**, from `GENERAL!TABLES` |
| `quantity` | number of units requested |

The routed path determines the vessel, the ETD/ETA and the transit time. It does
not affect the price.

## 3. Distance

`Distance KM` in the worked quotations is mislabelled: the values are **nautical
miles** taken straight from the `Distance NM` matrix, origin row and destination
column. Barcelona-Damietta reads 1898, which is the matrix cell, not the 2 672 NM
the Optimed rotation actually sails and not a distance in kilometres.

Verified on every row: 36 distinct distances, no exceptions.

## 4. Sea freight base (FEU)

The base is a **pure function of distance**. It does not depend on the port of
origin, the equipment, the service or the quantity. Checked across 202 rows and
36 distinct distances: no distance ever produced two different bases, and no two
origins ever produced different bases for the same distance.

The curve is smooth, concave below roughly 3 000 NM and exactly linear above it:

```
base(d) = 629.68 + 0.1259628 * d          for d >= ~4000 NM   (residual < 0.05)
```

Below that a positive residual appears, peaking at about +48 EUR near 1 300 NM
and returning to zero at both ends. No closed form tried so far reproduces it
(linear, quadratic, logarithmic, power and square-root fits all miss the middle
of the range by 15-20 EUR), which is consistent with the original being an
interpolation the export destroyed.

**Implementation**: linear interpolation over the 36 recovered anchors. Exact at
every distance the historical data ever quoted. A quotation whose distance falls
between two anchors carries `seaFreightStatus: 'needs-review'`, and the
confirmation page says the rate was interpolated.

## 5. What each charge is based on

This is the substance of the 2026-09-23 correction. Every line now declares
whether it follows the container or the shipment, and the confirmation page
prints that beside the amount.

### Per container

| Charge | Rule |
| --- | --- |
| Sea freight | `base × equipmentFactor × quantity` |
| Terminal handling | `thcTable[equipment][class] × quantity` |
| Port additional | `0.2 × thc × quantity` |
| Port taxes, VGM, ISPS, control, seal | `table[class] × quantity` |
| Dangerous goods (IMO) | `table[class] × quantity`, only when declared |
| Reefer plug-in | `plugIn[equipment] × quantity` |
| Bunker recovery (BRAF) | `brafBase[equipment] × 1.07^classIndex × quantity` |
| Emissions and ETS | scaled with the quantity |

`equipmentFactor` is column D of the `BOOKINGS!Tariffs` equipment block: 0.80 for
a 20' dry, 1.00 for a 40' dry (the FEU reference), 1.15 for a 45' HC, 1.25 for a
20' reefer, 1.30 for a 40' reefer, 1.07 for a 20' open top, up to 1.60 for
project cargo.

`1.07^classIndex` steps the bunker recovery up by 7 % for every class the origin
sits below A. Verified exactly: A = 1, B = 1.07, C = 1.1449, D = 1.225043.

### Per shipment

| Charge | Rule |
| --- | --- |
| Documentation | `table[class]` |
| Logistic management | `table[class]` |
| Customs clearance | `table[class]` |

One bill of lading, one booking, one customs declaration, however many
containers are on it.

### Never charged

The AMS manifest applies to US routes. SDG Lines serves none, so it is computed
for completeness and never added.

## 6. The tariff tables

Terminal handling is the second block of `BOOKINGS!Tariffs`: 16 equipment rows by
four port classes. A 20' reefer is 260 / 280 / 304 / 330 EUR for A / B / C / D.

The surcharge tables are not labelled anywhere in the workbook. They were
recovered from the worked quotations by the importer, which accepts a value only
when every row of a class agrees on it and reports a disagreement rather than
averaging:

| Surcharge | A | B | C | D |
| --- | --- | --- | --- | --- |
| Documentation | 54 | 66 | 72 | 78 |
| Logistic management | 8 | 10 | 12 | 14 |
| Customs clearance | 35 | 40 | 45 | 50 |
| Port taxes | 20 | 35 | 40 | 45 |
| VGM SOLAS | 25 | 30 | 35 | 40 |
| ISPS | 15 | 20 | 25 | 30 |
| Control | 20 | 25 | 30 | 35 |
| Seal | 10 | 11 | 12 | 15 |
| Dangerous goods (IMO) | — | — | 65 | 70 |

The two missing IMO rates are genuine gaps: no worked quotation ever carried
dangerous goods from a class A or B port. A quotation that needs one shows the
charge as `blocked` and the page says the total is understated, rather than
guessing.

## 7. Emissions

```
emissionsKgCo2e = emissionFactor(equipment) / 1000 * distanceNm * quantity
```

`emissionFactor` is the `Emissions (tn / Teu)` column: 85 for dry equipment, 140
for reefers, 68 for semi-trailers. The road comparison uses a second per-unit
factor recovered the same way (0.11645 dry, 0.1918 reefer), and `co2Saved` is
the difference.

## 8. ETS

```
ets = emissionsTonnes * 73.5899 + 20
```

73.5899 EUR per tonne reproduces all 202 worked quotations exactly.

The flat 20 EUR does not. The workbook adds it to 180 of the 202 and omits it
from the other 22, and nothing in the data separates the two groups: not the
quantity, the port class, the equipment, the distance or the route. It is kept,
per quotation, because most published quotations carry it and removing an amount
nobody can explain is as much of a guess as adding one. The line is marked
`under review` on the page. Setting `ETS_FIXED_COMPONENT_EUR` to 0 is the whole
of the change if the operator decides otherwise.

## 9. The four defects, and the correction

The live spreadsheet has four arithmetic faults. The first build of this tool
reproduced all four deliberately, because the brief asked for parity to the cent.
On 2026-09-23 the product owner instructed that the freight and every
cargo-handling charge must follow the number of containers, and they were fixed.

| # | Defect | Effect | Now |
| --- | --- | --- | --- |
| A | `TOTAL FREIGHT = base`, so the sea freight was charged **once** however many units were booked | A 20-container booking paid one container's freight | Fixed: `× quantity` |
| B | `PORT ADDITIONAL = 0.2 × thc × quantity²` | At 25 units it was 25 times too large | Fixed: linear in quantity |
| C | Emissions ignored the quantity | The CO2 figure understated a multi-unit shipment | Fixed: `× quantity` |
| D | The equipment factor was computed into a `Freight` column the total then ignored | A 20' reefer was charged a 40' dry's freight | Fixed: the factor is applied |

Two of these were large and pulled in opposite directions, which is why the
error was not obvious from the totals. Twenty 20' reefers Barcelona to Damietta:

| | Legacy | Corrected |
| --- | --- | --- |
| Sea freight | 912.15 | 22 803.73 |
| Port additional | 24 320.00 | 1 216.00 |
| Total | 34 800.63 | 35 647.62 |

The totals differ by 2 %. The composition does not resemble itself at all: the
old quotation was almost two thirds a port surcharge that should have been
3 % of it, and charged one container's freight for twenty.

Two further changes follow from the same instruction and are flagged for
confirmation, because the workbook charged them once and shipping practice
charges them per container:

- **Reefer plug-in**, now per container.
- **Bunker recovery (BRAF)**, now per container, since it adjusts the freight.

## 10. Still unresolved

- **The freight formula itself.** Interpolated between 36 anchors. The original
  is still readable in the Google Sheet; see item 12 in `docs/open-questions.md`.
- **The 20 EUR ETS component.** Section 8.
- **IMO rates from class A and B ports.** Section 6.
- **Two distances that disagree with themselves.** `GENERAL!Distance NM` is not
  symmetric for Barcelona-Oran (279 against 362 NM) or Jeddah-Abu Dhabi (2 452
  against 2 542 NM), so the direction a learner quotes in changes the price.

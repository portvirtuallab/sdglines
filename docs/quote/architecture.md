# The quotation tool

## What it replaced

A Google Form fed a Google Sheet. The sheet resolved a route across the service
rotations, picked a vessel, priced the shipment against its tariff tables, and a
document merge mailed a PDF back. A learner asked a question and waited.

The tool does the same work in the browser, and shows the answer immediately.
Same routings, same prices - `tests/unit/pricing.test.ts` replays every
quotation the old process ever produced and checks the new engine reproduces it.

## How it is put together

```
Excel workbooks (not committed)
        |
        |  npm run import:workbook
        v
src/data/quote/*.ts          generated, never hand-edited
        |
        v
src/lib/quote/
  network.ts     lookups over ports, services, vessels, equipment, distances
  routing.ts     finds journeys across the rotations, up to three vessels
  pricing.ts     the price, one rule at a time
  pin.ts         Port Virtual Lab PIN handling
  reference.ts   the SDGL-Q-XXXXXX quotation reference
        |
        v
src/components/quote/
  model.ts       the six-step draft and its validation
  QuoteWizard.tsx  the form itself, a React island
        |
        v
src/pages/request-a-quote.astro
```

Nothing in that chain is duplicated. The port list the form offers is the port
list the directory publishes; the transit times it quotes are the ones the route
pages show. A change to the workbook moves all of them together, which is the
point.

## Why there is no submission

GitHub Pages serves static files. There is no server to submit to, and the brief
forbids sending a learner's details to an unapproved service.

That is not a compromise here. The exercise is about deciding what a shipment
needs and reading back what was asked for, and the tool now answers the question
the old form could only forward. Nothing is stored, nothing is transmitted, and
the page says so.

**If a submission is wanted later**, the change is contained. `produce()` in
`QuoteWizard.tsx` is where a completed draft becomes a quotation. Adding a POST
there - and nowhere else - is the whole of the work. Anything that collects
personal data needs the privacy review that `docs/forms.md` describes first.

## Two sets of pricing rules

`src/lib/quote/pricing.ts` implements both, selected by one argument.

**`corrected`** is what the site charges. The four arithmetic faults in the live
spreadsheet are fixed: the freight and every cargo-handling charge follow the
number of containers, the port additional is linear rather than squared, and the
equipment factor is actually applied.

**`legacy`** is the spreadsheet's own arithmetic, faults included. The site never
uses it. It exists so the regression suite can keep replaying the 202 historical
quotations and proving the reverse-engineering was right, which is the only
evidence that the tariff tables and the freight curve were read correctly.

Section 9 of `pricing-model.md` sets out the four defects and what changed.

## Running the import

```bash
npm run import:workbook -- \
  --general "SDGLINESV2(GENERAL_DATA).xlsx" \
  --bookings "SDG Lines - Bookings_V3_FORM (Responses).xlsx"
```

It prints what it read, every correction it applied, and everything that needs a
human decision. Then:

```bash
npm run typecheck && npm test && npm run test:e2e
```

The unit suite fails if a price moved, and the end-to-end suite fails if the
form stopped producing one. Neither can be satisfied by adjusting the test: the
expected figures come from the workbook itself.

## What the tool refuses to do

- **Invent a sailing date.** No schedule is published, so the departure date is
  recorded as a request and never dressed up as a confirmed sailing.
- **Price a lane with no distance.** The matrix is the only source, and a
  missing cell is an error rather than an estimate.
- **Claim an activity code is valid.** A static page cannot check a four-digit
  code against anything; it validates the format and says no more. See
  `pin-validation.md`.
- **Hide where a number came from.** A freight rate interpolated between two
  published ones says so on the page, and a charge whose rate is missing is
  shown as unknown with the total flagged as understated, never guessed.

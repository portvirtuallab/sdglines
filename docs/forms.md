# Forms

There is one form on the site: the simulated quotation request at `/quote`.

---

## How it works now

**It does not submit anywhere.** It validates in the browser, derives a quotation reference from the
shipment details, and renders the result on the page. No network request is made and nothing is
stored.

Three reasons, in order of weight:

1. **GitHub Pages has no backend.** There is nowhere to submit to.
2. **The brief forbids sending personal data to an unapproved service.** Any third-party form
   service would be exactly that.
3. **It is sufficient.** What a learner needs to practise is deciding what a shipment requires and
   reading back what they asked for. A round trip to a server adds latency and a privacy obligation,
   and teaches nothing extra.

### What it asks for, and what it does not

Fields: port of loading, port of discharge, preferred service, cargo type, equipment, number of
units, gross weight, cargo ready date, commodity description, exercise reference.

**No name. No e-mail address. No telephone number. No company.** The simulation does not use them,
so collecting them would be collecting personal data for nothing. The one free-text field that could
attract personal data — the exercise reference — carries a hint asking learners not to enter any.

### The quotation reference

Format `SDG-YYDDD-XXXX`: a two-digit year, the day of the year, and four characters derived from a
hash of the shipment details.

Deriving the suffix from the shipment rather than at random means **the same shipment produces the
same reference**. A learner who corrects a detail and resubmits does not end up with two references
for one shipment, and a trainer can reproduce a reference from the shipment description.

### Validation

Written by hand rather than left to the browser, so that messages say what to do rather than what is
wrong, and so all errors can be collected into one summary that a screen reader announces.

Rules: both ports required and different from each other; cargo type and equipment required; units a
whole number between 1 and 500; weight optional but positive if given.

### Pre-selection

`/quote?origin=valencia` and `/quote?service=eastmed` pre-select the field, so "Quote from Valencia"
on a port page does not drop the learner into an empty form. Values are checked against the options
before being applied.

---

## Connecting a real backend later

Should a real submission ever be needed, **one function changes**. In the `submit` handler in
`src/pages/quote.astro`, replace the artificial delay:

```ts
await new Promise((resolve) => setTimeout(resolve, 600));
```

with a request:

```ts
const response = await fetch(QUOTE_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(values),
});

if (!response.ok) {
  // Show the error state. Do not lose what the learner typed.
  throw new Error(`Quotation request failed: ${response.status}`);
}

const { reference } = await response.json();
```

The loading, success and error states already exist and are already wired up. The error path is the
one to exercise: a network failure must leave the form populated and show a message, never clear it.

### Before doing that, decide these

**Where does it go?** A Port Virtual Lab endpoint is the obvious answer, since that is where the
exercise lives. A third-party form service means visitor data leaves Escola Europea's control and
needs a privacy assessment.

**What is stored, and for how long?** Adding a submission adds a retention obligation. Storing only
the shipment details and a reference — no personal data — keeps that obligation small.

**What does the endpoint accept?** It must validate independently. Client-side validation is a
usability feature, never a security boundary.

**CORS.** A static site on `www.sdglines.com` posting to an endpoint elsewhere needs the endpoint to
allow that origin explicitly.

**Rate limiting.** A public endpoint with no authentication will be found. Rate limit it.

**Update the privacy page.** `/privacy` currently states that nothing is transmitted. If that
changes, the page has to change in the same pull request. It is the sort of statement that quietly
becomes untrue.

---

## Tracking

`/resources/tracking` has no form. A tracking page needs a system behind it that knows where
shipments are; SDG Lines has no shipments, so a tracker could only show invented movements — a trap
in an assessed exercise rather than a feature.

The page instead explains what carrier tracking events mean, which is the transferable knowledge,
and points at Port Virtual Lab for the shipment status in an actual exercise.

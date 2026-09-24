# Forms

There is one form on the site: the quotation tool at `/request-a-quote`.

This document covers how it handles a learner's input and what connecting a real backend would
involve. How the tool is built, and where its prices come from, is in
[`docs/quote/architecture.md`](quote/architecture.md).

---

## How it works now

**It does not submit anywhere.** It validates in the browser, resolves the routing, prices the
shipment against the operational data, derives a quotation reference and renders the result on the
page. No network request is made and nothing is stored.

Three reasons, in order of weight:

1. **GitHub Pages has no backend.** There is nowhere to submit to.
2. **The brief forbids sending personal data to an unapproved service.** Any third-party form
   service would be exactly that.
3. **It is sufficient.** The old process forwarded the question and mailed an answer back. The tool
   answers it. A round trip adds latency and a privacy obligation and teaches nothing extra.

### What it asks for, and what it does not

Six steps:

| Step | Asks for |
| --- | --- |
| 01 Route | Port of origin, port of destination, desired departure date |
| 02 Cargo & equipment | Dangerous goods (and UN number, proper shipping name, IMO class, packing group if so), type of service, unit type, number of units |
| 03 Additional services | VGM SOLAS |
| 04 Contact | Name, e-mail, company or institution, country, and optionally department, position and city; Port Virtual Lab activity code; privacy acknowledgement |
| 05 Review | Nothing. Every section can be edited from here |
| 06 Confirmation | Nothing. The quotation, its breakdown and its reference |

The contact details appear on the quotation the learner receives, which is why they are asked for -
the previous form asked for the same ones. **No telephone number and no address**, because nothing
in the exercise uses them, and collecting personal data for nothing is the failure mode worth
avoiding. The privacy acknowledgement is never pre-ticked.

Everything stays in the browser and is discarded when the tab closes. There is no `localStorage`
either, deliberately: on a shared classroom machine, restoring the previous learner's details would
be a worse problem than retyping them.

### The quotation reference

Format `SDGL-Q-XXXXXX`, from an alphabet with no `I`, `O`, `0` or `1`, because these get read aloud
across a classroom and written down by hand.

The six characters derive from the shipment and the second it was produced, so two learners working
side by side do not collide, and a learner who reloads within the same second sees the same
reference rather than a confusing new one.

### Validation

Per step, written by hand rather than left to the browser, so that messages say what to do rather
than what is wrong, and so that all errors are collected into one summary that a screen reader
announces before anything else. The summary is focused on failure; each entry links to its field.

The rules live in `src/components/quote/model.ts`, one function, so the wording a learner reads is
the wording the rule carries.

Two of them are worth knowing about because they come from the data rather than from taste:

- **A destination is only offered if the network can reach it.** The list is built by the routing
  engine from the chosen origin, so an unservable pair cannot be selected in the first place.
- **A port with no freight rate is not offered as an origin.** Nothing is in that position today;
  Palma was until the product owner supplied a class and a base index on 2026-09-23.

### Pre-selection

`/request-a-quote?origin=valencia` pre-selects the origin, so "Quote from Valencia" on a port page
does not drop the learner into an empty form. An unknown slug is ignored silently: the learner did
not type it, so there is nothing for them to fix.

### The activity code

Four digits, checked for format and printed on the quotation so it can be tied to an activity.
Nothing more: a static page cannot check a four-digit code against anything, and the machinery that
used to imply otherwise was removed on 2026-09-23. See
[`docs/quote/pin-validation.md`](quote/pin-validation.md).

---

## Connecting a real backend later

**One function changes.** `produce()` in `src/components/quote/QuoteWizard.tsx` is where a completed
draft becomes a quotation. Add the request there:

```ts
const response = await fetch(QUOTE_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ request, contact }),
});

if (!response.ok) {
  // Show the error state. Do not lose what the learner typed.
  throw new Error(`Quotation request failed: ${response.status}`);
}
```

The error path is the one to exercise: a network failure must leave the draft populated and show a
message, never clear it. The draft is a single object held in one place precisely so that this stays
true.

### Before doing that, decide these

**Where does it go?** A Port Virtual Lab endpoint is the obvious answer, since that is where the
exercise lives. A third-party form service means visitor data leaves Escola Europea's control and
needs a privacy assessment.

**What is stored, and for how long?** Adding a submission adds a retention obligation. The tool now
asks for a name, an e-mail address and an organisation, so this is no longer a question about
shipment data alone.

**What does the endpoint accept?** It must validate independently. Client-side validation is a
usability feature, never a security boundary.

**CORS.** A static site on `www.sdglines.com` posting to an endpoint elsewhere needs the endpoint to
allow that origin explicitly.

**Rate limiting.** A public endpoint with no authentication will be found. Rate limit it.

**Update the privacy page.** `/privacy` currently states that nothing you type is transmitted or
stored. If that changes, the page has to change in the same pull request. It is the sort of
statement that quietly becomes untrue.

---

## Tracking

`/resources/tracking` has no form. A tracking page needs a system behind it that knows where
shipments are; SDG Lines has no shipments, so a tracker could only show invented movements — a trap
in an assessed exercise rather than a feature.

The page instead explains what carrier tracking events mean, which is the transferable knowledge,
and points at Port Virtual Lab for the shipment status in an actual exercise.

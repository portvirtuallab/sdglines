# The first thirty days

A plan for the period after the preview goes live, ending with a decision about the custom domain.

The measure of success is not traffic. It is whether a participant can find what they need without
asking a trainer.

---

## Week 1 — Review and verification

**Goal:** the product owner has seen the site and the outstanding questions have answers.

|                                                       |                                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------------ |
| Product owner reviews the preview                     | Whole site, not just the home page                                             |
| Walk through [`open-questions.md`](open-questions.md) | Ten items; answering 1, 2 and 3 unblocks most of the value                     |
| Confirm the removals                                  | Testimonials, 2020 news, the air cargo article — see [`audit.md`](audit.md) §6 |
| Confirm the corrected names                           | Two vessels, six ports                                                         |
| Two trainers use the site in a real session           | Watch, do not help. Where they help a learner is where the site failed         |

**Deliverable:** answers to the open questions, and a list of what the trainers had to explain.

---

## Week 2 — Close the content gaps

**Goal:** no route page says "To be confirmed" where an answer now exists.

- Enter confirmed frequencies and transit times; set the affected records to `verified`
- Confirm or correct the five rotations
- Decide whether arrival charge amounts are published centrally or left to the trainer
- Enter vessel particulars if supplied
- Resolve "Reffles"/"Raffles" and the Gimnesias vessel assignment
- Move each resolved item to the "Answered" section of `open-questions.md`, with the date and
  decision

Run `npm run validate:content` after each change. Each is a `content:` commit and a small pull
request, so the reasoning stays attached to the change.

**Deliverable:** fewer records marked `needs-review`, and a note of which remain and why.

---

## Week 3 — Use it in anger

**Goal:** find what only real use finds.

- Run at least two full exercises against the site
- Collect every question a participant asked that the site should have answered
- Check it on the devices people actually bring, on the network they are actually on
- Run Lighthouse against the deployed preview and record the four scores
- Repeat the manual accessibility checks in [`accessibility.md`](accessibility.md)

**Watch for these specifically**, because they are the likely failure modes:

| Symptom                                       | What it probably means                                   |
| --------------------------------------------- | -------------------------------------------------------- |
| Participants ask a trainer where something is | The information architecture is wrong for that task      |
| Participants search and find nothing          | Missing content, or missing keywords in the search index |
| Participants give up on the quotation form    | A field is unclear or a validation message is unhelpful  |
| Trainers tell participants to ignore a page   | That page should not be published in its current state   |

**Deliverable:** a prioritised list of fixes, as issues.

---

## Week 4 — Fix, decide, and prepare

**Goal:** a decision about the custom domain, made on evidence.

- Fix what week 3 found, highest impact first
- Re-run the full test suite and Lighthouse
- Write the summary of changes into `/resources/news`, so trainers with older exercises know what
  moved
- Prepare the domain move: work through the pre-flight list in
  [`custom-domain.md`](custom-domain.md), including **lowering the DNS TTL 24 hours ahead**

### The decision

Move the domain when all of these hold:

- [ ] The product owner has approved the site
- [ ] Two exercises have been run against it without the trainers needing to work around it
- [ ] Open questions 1, 2 and 3 are resolved, or explicitly accepted as outstanding
- [ ] Lighthouse meets the targets in [`deployment.md`](deployment.md)
- [ ] The rollback prerequisites in [`rollback.md`](rollback.md) are in place

If any is unmet, stay on the preview. There is no deadline pressure: the live site is working and
the preview costs nothing to keep.

---

## What to measure afterwards

Conversion here does not mean a sale. The actions that matter:

| Signal                                                 | Why it matters                                          |
| ------------------------------------------------------ | ------------------------------------------------------- |
| Questions trainers have to answer that the site should | The clearest measure of whether the site works          |
| Searches returning nothing                             | Names a missing page or a missing keyword               |
| Quotation forms started and abandoned                  | Points at a specific field                              |
| Time from arriving to finding a rotation               | The primary objective, measured                         |
| Issues reported by trainers and learners               | Sustained reporting means people trust it will be fixed |

Analytics are **not** installed, and should not be added without documenting the privacy
implications and getting approval for the tool. Most of the list above is better answered by
watching two sessions than by a dashboard.

---

## Keeping it alive

The clearest failure mode for this site is the one the previous version had: content that stopped
being maintained, and a news section whose most recent item was six years old.

| Cadence      | Task                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| Per exercise | Note anything a participant could not find                                    |
| Monthly      | Review records still marked `needs-review`                                    |
| Quarterly    | Re-run the manual accessibility checks; review Dependabot pull requests       |
| Annually     | Re-verify port and route data against the simulation as it is actually taught |

The `lastReviewed` date on every record exists for this. A record nobody has looked at in two years
is visible in the data, and can be found without reading the whole site.

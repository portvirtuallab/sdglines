# The Port Virtual Lab activity code

## The situation

`BOOKINGS!Verification` lists 34 four-digit codes in clear. They are the codes
trainers issue for an activity. This repository is public.

So: **the workbook is never committed, the codes never appear in any generated
file, and the importer never reads that sheet.** If you are handed a new
workbook, put it outside the repository and pass its path to
`npm run import:workbook`.

## What the site does with the code

It checks that it is four digits, puts it on the quotation, and says nothing
about whether it is real.

That is the whole of it, and it is deliberate.

## Why there is no check against the list

An earlier version of this shipped PBKDF2 digests of the 34 codes and hashed the
entered code against them over 600 000 rounds. It was removed on 2026-09-23.

The reasoning, because it will come up again:

The site is served by GitHub Pages. Everything it knows, the browser knows. A
four-digit code has ten thousand possible values, so any check that runs in the
browser can be defeated by trying all of them. That is not a weakness of a
particular technique; it follows from the size of the key space and from where
the check runs.

The slow hash did raise the cost of an exhaustive sweep from under a second to
roughly an hour. But an hour is not a control, and the machinery looked like
one. Something that implies a guarantee it cannot give is worse than nothing,
because sooner or later a decision gets made on the strength of it.

Shipping plain SHA-256 digests, the obvious first idea, would have been worse
still: all 34 codes recoverable in well under a second.

## If the codes need to be genuinely checked

They have to stay somewhere the browser cannot read, which means a request to a
service.

`validatePin` in `src/lib/quote/pin.ts` is the only place in the codebase that
judges a code. Replacing its body with a `fetch` is the whole of the change: the
wizard asks the question, takes back an answer, and knows nothing about how the
answer was reached.

Two things to keep if you do:

- **Keep the format check on the client**, so a typo does not cost a round trip.
- **Fail open when the check itself cannot run.** A learner should not be locked
  out of a training exercise because a service is down.

## Rotating a code

The codes live in the workbook and nowhere else in this project. Change them
there. Nothing in the repository needs to change, because nothing in the
repository knows them.

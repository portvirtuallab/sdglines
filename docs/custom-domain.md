# Moving www.sdglines.com to this deployment

> **Do not carry out this procedure without explicit written authorisation from the product owner.**
>
> Everything in this repository up to this point is additive: the preview deployment exists
> alongside the live website and affects nothing. This procedure is the one that replaces the live
> website, and it is the only irreversible-feeling step in the project.
>
> Nothing in `.github/workflows/` performs any of it. It is manual, by design.

---

## Before you start

- [ ] The product owner has approved the new site in writing, after reviewing the preview.
- [ ] The open items in [`open-questions.md`](open-questions.md) have been resolved or explicitly
      accepted as outstanding.
- [ ] Someone with access to the DNS zone for `sdglines.com` is available.
- [ ] The current hosting is documented, including how to restore it. See
      [`rollback.md`](rollback.md).
- [ ] A copy of the current live site has been taken, so that the previous content is recoverable
      independently of the previous host.
- [ ] The move is scheduled outside teaching hours, and no course is running that depends on the
      site.

---

## What changes, and what does not

The site is already built to be served from either address. Moving the domain changes two
environment variables and adds one file. It does **not** change any page, component or link.

|                | Preview                            | Custom domain              |
| -------------- | ---------------------------------- | -------------------------- |
| `SITE_URL`     | `https://portvirtuallab.github.io` | `https://www.sdglines.com` |
| `BASE_PATH`    | `/sdglines`                        | `/`                        |
| `public/CNAME` | absent                             | `www.sdglines.com`         |

---

## Procedure

### Step 1 — Decide on apex or www

The recommendation is **`www.sdglines.com` as the canonical address**, with the apex
`sdglines.com` redirecting to it. GitHub Pages handles the apex-to-www redirect automatically when
`www` is configured as the custom domain and the apex A records point at GitHub.

### Step 2 — Lower the DNS TTL, and wait

At least 24 hours before the move, reduce the TTL on the records you are about to change to **300
seconds**. This is the single most useful thing you can do to make a rollback fast: with the
default TTL of an hour or more, a mistake takes hours to undo rather than minutes.

Wait for the old TTL to expire before continuing.

### Step 3 — Add the CNAME file to the repository

```bash
echo "www.sdglines.com" > public/CNAME
```

Commit it on a branch, open a pull request, and merge to `main` only when you are ready to proceed.
GitHub Pages reads this file on deployment and sets the custom domain from it.

### Step 4 — Update the build target

In `.github/workflows/deploy.yml`, both occurrences:

```yaml
env:
  SITE_URL: https://www.sdglines.com
  BASE_PATH: /
```

Commit with the CNAME change so that the two never disagree.

### Step 5 — Change the DNS records

For the `www` subdomain:

```
www.sdglines.com.    CNAME    portvirtuallab.github.io.    TTL 300
```

For the apex, four A records and four AAAA records pointing at GitHub Pages. Take the current
addresses from the [GitHub Pages documentation on apex domains](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
rather than from this file — they have changed before and will change again.

**Remove the records pointing at the previous host.** Leaving them in place produces intermittent
behaviour that is very hard to diagnose: some visitors reach the new site and some the old one,
depending on which record their resolver returns.

### Step 6 — Verify the DNS change before touching anything else

```bash
dig +short www.sdglines.com
# expect: portvirtuallab.github.io. and the GitHub Pages addresses

dig +short sdglines.com
# expect: the four GitHub Pages A records
```

Propagation is usually minutes with a 300-second TTL, but resolvers that ignored your TTL can take
up to 48 hours. Do not proceed until `dig` returns what you expect.

### Step 7 — Confirm the domain in GitHub

**Settings → Pages → Custom domain.** It should already show `www.sdglines.com` from the CNAME file
and report the DNS check as passing. If it reports an error, fix the DNS before continuing; do not
retry in a loop.

### Step 8 — Enable HTTPS

Once the DNS check passes, **Enforce HTTPS** becomes available. Tick it.

The certificate is issued by Let's Encrypt and usually takes a few minutes, occasionally up to an
hour. Until it is issued, the site is reachable over HTTP and browsers will warn. This is the window
during which the site looks broken to a cautious visitor, which is why the move is scheduled outside
teaching hours.

### Step 9 — Verify the live site

- [ ] `https://www.sdglines.com/` loads, styled, with a valid certificate
- [ ] `http://www.sdglines.com/` redirects to HTTPS
- [ ] `https://sdglines.com/` redirects to `www`
- [ ] A deep link loads cold: `https://www.sdglines.com/ports/barcelona`
- [ ] A legacy redirect works: `https://www.sdglines.com/pireaus` → `/ports/piraeus`
- [ ] A nonsense path shows the 404 page
- [ ] `https://www.sdglines.com/sitemap-index.xml` lists the pages with the correct domain
- [ ] Canonical tags point at `www.sdglines.com`, not at `portvirtuallab.github.io`
- [ ] The quotation form, the port filters, the search and the map all work
- [ ] The simulation notice is visible

### Step 10 — Restore the TTL, and tell people

- Raise the TTL back to its normal value once you are satisfied, typically after a week.
- Submit the new sitemap in Google Search Console.
- Tell the trainers. Addresses have changed, and anyone with an exercise written against the old
  site should read the summary at `/resources/news`.

---

## What breaks if you get it wrong

| Mistake                                         | Symptom                                                                 | Fix                                 |
| ----------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------- |
| `BASE_PATH` left as `/sdglines`                 | Every internal link 404s; CSS does not load                             | Rebuild with `BASE_PATH=/`          |
| CNAME file missing                              | GitHub Pages serves the project site; the domain does not resolve to it | Add `public/CNAME` and redeploy     |
| Old host records left in DNS                    | Some visitors see the old site, some the new one                        | Remove the old records              |
| HTTPS enforced before the certificate is issued | Certificate warnings                                                    | Wait; do not toggle repeatedly      |
| `SITE_URL` not updated                          | Canonical tags and sitemap point at github.io, splitting search ranking | Rebuild with the correct `SITE_URL` |

---

## Rollback

Documented separately in [`rollback.md`](rollback.md), with a target of under fifteen minutes to
restore the previous site if the TTL was lowered as described in step 2.

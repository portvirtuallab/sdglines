# Rollback

Three things can go wrong, and they need different responses. Identify which one you have before
acting.

---

## 1. A bad deployment to the preview

**Symptom:** the preview at `portvirtuallab.github.io/sdglines/` is broken. The live website is
unaffected.

**Urgency:** low. Fix it properly.

```bash
git checkout main
git pull
git revert <bad-commit-sha>
git push
```

The deploy workflow runs and publishes the previous state. There is no manual un-deploy in GitHub
Pages; a rollback is a forward deployment of earlier content.

To revert a merge commit, name the mainline parent: `git revert -m 1 <merge-sha>`.

**If the build itself is broken** and you cannot deploy anything: GitHub Pages keeps serving the
last successful deployment. You are not down, you are stale. Fix the build.

---

## 2. A bad deployment after the custom domain has moved

**Symptom:** `www.sdglines.com` is serving the new site and it is broken.

**Urgency:** high if a course is running.

**Do not change DNS.** DNS is not the problem and changing it makes diagnosis harder. Revert the
commit as in case 1. Time to recovery is the workflow duration, typically three to five minutes.

```bash
git revert <bad-commit-sha> && git push
# Watch: https://github.com/portvirtuallab/sdglines/actions
```

---

## 3. The custom domain move itself has to be undone

**Symptom:** `www.sdglines.com` points at GitHub Pages and the decision is to go back to the
previous host.

**Urgency:** high.

**Time to recovery:** a few minutes if the TTL was lowered to 300 seconds before the move, as
[`custom-domain.md`](custom-domain.md) step 2 requires. Up to 48 hours if it was not. This is the
entire reason that step exists.

### Procedure

**1. Restore the DNS records** to their previous values.

Restore exactly what was recorded before the move, and remove the GitHub Pages A, AAAA and CNAME
records. You cannot leave both sets in place: visitors would reach one or the other unpredictably.

**2. Verify.**

```bash
dig +short www.sdglines.com   # expect the previous host
dig +short sdglines.com
```

**3. Remove the custom domain from GitHub.**

Settings → Pages → Custom domain → clear the field. Then delete `public/CNAME` and revert the
`SITE_URL` and `BASE_PATH` values in `.github/workflows/deploy.yml` to the preview values.

This step matters: leaving the domain configured in GitHub while the DNS points elsewhere produces
confusing certificate errors later.

**4. Confirm the previous site is serving.**

Check a page, not just the home page. Check it in a browser that has not visited the site recently,
or in a private window: browsers cache HTTPS redirects aggressively and will keep sending you to the
new site long after DNS has changed.

---

## Prerequisites, to be in place before the domain moves

These are the things that make a rollback possible. Confirm them before step 3 of the domain move,
not after.

- [ ] DNS TTL lowered to 300 seconds at least 24 hours earlier
- [ ] The previous DNS records recorded exactly, including TTLs
- [ ] The previous hosting account still active, with the site still deployed on it
- [ ] A complete copy of the previous site taken and stored independently
- [ ] The name of someone with DNS access, and a way to reach them out of hours

---

## What cannot be rolled back

**Search engine indexing.** Once search engines have crawled the new addresses, reverting produces a
period during which indexed URLs 404. Nothing makes that instant. The legacy redirects are the
mitigation and they work in both directions, which is a further reason to keep the redirect map
accurate.

**Links people have already shared.** Anyone who bookmarked a new address during the window will hit
a dead link after a rollback.

Neither is a reason not to roll back a genuinely broken site. Both are reasons to verify the preview
thoroughly first.

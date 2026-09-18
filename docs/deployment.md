# Deployment

---

## Current state

|                               |                                            |
| ----------------------------- | ------------------------------------------ |
| **Preview (this repository)** | https://portvirtuallab.github.io/sdglines/ |
| **Live website (untouched)**  | https://www.sdglines.com                   |

> **The live website is not affected by this repository.** No workflow here changes DNS, domain
> configuration, or any file served by the existing host. Moving the custom domain is a manual
> change requiring explicit authorisation. See [`custom-domain.md`](custom-domain.md).

---

## One-time repository setup

Needed once, by someone with admin rights on the repository.

1. **Settings → Pages → Build and deployment → Source:** select **GitHub Actions**.
   Not "Deploy from a branch". The workflow uploads an artifact and deploys it directly.
2. **Settings → Environments:** a `github-pages` environment appears after the first deployment.
   Optionally add required reviewers to gate deployments.
3. No secrets are required. Deployment authenticates with the workflow OIDC token.

---

## How a deployment happens

Every push to `main` runs `.github/workflows/deploy.yml`:

1. Install dependencies with `npm ci`
2. Type check (`astro check`)
3. Validate content integrity
4. Run unit tests
5. Build with `SITE_URL=https://portvirtuallab.github.io` and `BASE_PATH=/sdglines`
6. `touch dist/.nojekyll`
7. Upload and deploy

A failure at any step stops the deployment. The previously deployed version stays live.

### Why `.nojekyll`

GitHub Pages runs Jekyll by default, and Jekyll ignores files and directories whose names begin with
an underscore. Astro emits its hashed assets into `_astro/`. Without this file, every page deploys
successfully and renders completely unstyled.

---

## Building locally

```bash
# As deployed to the GitHub Pages preview
npm run build:pages

# As it will be on the custom domain
SITE_URL=https://www.sdglines.com BASE_PATH=/ npm run build:pages

# Serve the production build
npm run preview
```

Only two environment variables control the deployment target:

| Variable    | Preview                            | Custom domain              |
| ----------- | ---------------------------------- | -------------------------- |
| `SITE_URL`  | `https://portvirtuallab.github.io` | `https://www.sdglines.com` |
| `BASE_PATH` | `/sdglines`                        | `/`                        |

They feed the canonical URLs, the Open Graph URLs, the sitemap, every internal link (through
`url()` in `src/lib/site.ts`) and every legacy redirect destination. Nothing else in the codebase
knows where the site is deployed.

---

## Verifying a deployment

After the workflow finishes, check these rather than assuming:

**1. The site loads and is styled.**
Open https://portvirtuallab.github.io/sdglines/. Unstyled text means `.nojekyll` is missing.

**2. A deep link works on a cold load.**
Open https://portvirtuallab.github.io/sdglines/ports/barcelona directly, not by navigating. This
proves directory-style URLs resolve.

**3. A legacy redirect works.**
https://portvirtuallab.github.io/sdglines/pireaus should land on `/sdglines/ports/piraeus`.

**4. The 404 page appears.**
Request a nonsense path. GitHub Pages serves `404.html` automatically.

**5. The simulation notice is visible** below the header.

**6. The sitemap is present** at `/sdglines/sitemap-index.xml`.

**7. Interactive pieces work:** the port directory filter, the search page, the quotation form, and
the map at `/ports/map`.

---

## Rolling back

See [`rollback.md`](rollback.md). In short: revert the commit on `main` and let the workflow deploy
the previous state. There is no manual un-deploy.

---

## Performance targets

Measured with Lighthouse against the deployed preview, not the dev server.

| Category       | Target |
| -------------- | ------ |
| Performance    | ≥ 90   |
| Accessibility  | ≥ 95   |
| Best practices | ≥ 95   |
| SEO            | ≥ 95   |

What the build does to earn them:

- No JavaScript framework on any page except `/ports/map`
- Fonts self-hosted as variable fonts, with no third-party request
- Critical CSS inlined by Astro where it is small enough
- The network chart is inline SVG, so it costs no request
- Leaflet is loaded with `client:visible` and only on the map page
- No images in the critical path — the hero visual is SVG

The most likely regression is somebody adding a hero photograph. If that happens, use Astro's
`<Image>` component so the file is processed at build time, and check the Lighthouse score before
merging.

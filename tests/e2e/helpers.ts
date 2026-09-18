/**
 * Test helpers.
 *
 * The site is served under a base path on GitHub Pages, and Playwright resolves
 * a path beginning with a slash against the ORIGIN of `baseURL`, discarding any
 * path component. So `page.goto('/routes')` against a baseURL of
 * `http://localhost:4322/sdglines` requests `/routes`, which does not exist.
 *
 * Rather than dropping the leading slash everywhere and relying on everyone
 * remembering why, every navigation goes through `path()`. It also means the
 * tests exercise the same base path the deployed site uses, so a base path
 * regression fails the suite instead of reaching production.
 */
export const BASE_PATH = '/sdglines';

/** Turn a site-relative path into one that includes the deployment base path. */
export function path(sitePath: string): string {
  const normalised = sitePath.startsWith('/') ? sitePath : `/${sitePath}`;
  return `${BASE_PATH}${normalised}`;
}

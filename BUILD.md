# Build & deploy

This site can be deployed two ways. Pick one.

## Option A — Static (current default, no build step)

Files are served as-is. JSX is transpiled in the browser by `@babel/standalone`.
Pros: zero tooling. Cons: ~410 KB of JS download, ~600 ms transpile cost on every visit.

Just upload the project root.

## Option B — Vite build (recommended for production)

Eliminates Babel-in-browser, ships one minified JS bundle (~70 KB gzip) and one CSS bundle.

```bash
npm install
npm run build      # outputs ./dist — deploy this folder
npm run preview    # smoke-test on http://localhost:5000
```

The `dist/` folder is fully self-contained and works behind any static host
(Netlify, Cloudflare Pages, S3+CloudFront, Nginx).

### After the first deploy

Compute SRI hashes for the CDN scripts (only needed if you keep loading React from unpkg
in the static build):

```bash
npm run sri
```

Paste the printed `integrity="sha384-..."` attributes into the `<script>` tags in
`index.html`. With Vite, React is bundled in — SRI isn't needed.

## Edge configuration

The `_headers` file at the project root is consumed automatically by
Netlify and Cloudflare Pages. It sets HSTS, CSP, X-Content-Type-Options,
Referrer-Policy, Permissions-Policy, COOP, CORP, and one-year immutable
cache for hashed assets. If deploying elsewhere, port these to that
platform's config format.

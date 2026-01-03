Project snapshot
- Angular 20 app using Angular Universal (SSR) and NgRx. See `package.json` scripts and `src/main.server.ts`, `src/server.ts`.

Quick start commands
- `ng serve` — dev server (live reload).
- `ng build` — client build.
- `npm run build:ssr` — client + server production build.
- `npm run build:server` — server build only.
- `npm run prerender` — run Angular prerender.
- `npm run serve:ssr:application-shoppyness` — run the SSR server from `dist/application-shoppyness/server/server.mjs`.
- `npm run generate-sitemap` — runs `tools/generate-sitemap.js` to build `public/sitemap.xml`.

Architecture & important files
- Entry points: [src/main.ts](src/main.ts) (client), [src/main.server.ts](src/main.server.ts) (server). Server bootstrap: [src/server.ts](src/server.ts).
- Routes: [src/app/app.routes.ts](src/app/app.routes.ts) and server-specific [src/app/app.routes.server.ts](src/app/app.routes.server.ts).
- API / serverless: [api/index.js](api/index.js) — Vercel-style endpoints; see `vercel.json` for routing.
- Services: all services live under `src/app/services/` (e.g., `product.ts`, `checkout.ts`). Modify here for business logic.
- State: NgRx store usage under `src/app/store/` and `src/app/commons/store.ts` — prefer using NgRx patterns when adjusting global state.
- Guards & interceptors: `src/app/commons/gaurds/` (note folder name typo) and `src/app/commons/interceptors/`.

Conventions & patterns to follow
- Standalone components: many components use `@Component({ imports: [...] })`. When adding components prefer the standalone pattern over module registration.
- Dependency injection: team often uses `inject()` (from `@angular/core`) inside components instead of constructor injection — follow existing style when editing components (see `src/app/components/order-success/order-success.ts`).
- File pairing: component code lives alongside `*.html` and `*.scss` in `src/app/components/*` and `src/app/pages/*`.
- Styling: SCSS is used globally and per-component. Keep class names and BEM-like structure consistent with existing files in `src/app/*`.
- Payment integration: Cashfree JS is present — types live in `src/app/services/cashfree-payment.d.ts` and `types/cashfree-js.d.ts`. Keep sensitive keys out of repo and use environment files.

Build & debugging notes
- SSR build outputs to `dist/application-shoppyness/`; server entrypoint is `dist/.../server/server.mjs`. Use `npm run build:ssr` then `npm run serve:ssr:application-shoppyness` to reproduce server rendering locally.
- Prerendering and server routes: `ng run ...:prerender` uses route hints in `app.routes.server.ts` — check there if static pages are missing.
- Sitemaps and static assets: `tools/generate-sitemap.js` updates `public/sitemap.xml`; run `npm run generate-sitemap` after routing changes.

Testing & lint
- Unit tests: run `ng test` (Karma). There are some spec files under components and services; add tests next to files when extending logic.

Integration points
- `vercel.json` + `api/index.js` are used for serverless deployments; changes here affect production routing.
- External services: Cashfree payments, Google Analytics (check `src/app/commons/store.ts` and `gaurds`), and cookie-based auth (`ngx-cookie-service`).

When editing code — practical examples
- To add a new standalone component: place files in `src/app/components/<name>/`, use `@Component({ standalone: true, imports: [CommonModule], ... })`.
- To change a service behavior: update `src/app/services/<service>.ts` and add unit tests in the same folder using existing `*.spec.ts` patterns.
- To modify SSR behavior: inspect `src/main.server.ts` and `src/server.ts` before changing server-side logic.

Gotchas
- Folder `src/app/commons/gaurds` is misspelled — be careful when importing by path.
- `serve:ssr` expects the server build artifact at `dist/application-shoppyness/server/server.mjs`.

If anything here is unclear or you'd like a different tone (more examples, stricter rules, or automated PR check suggestions), tell me which parts to expand.

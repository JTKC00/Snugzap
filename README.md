# Snugzap Portfolio

Phase 1 landing page for [snugzap.com](https://snugzap.com/): a quiet home for independent software, games and experiments by James.

## Stack

- Vite and TypeScript
- Plain semantic HTML and CSS
- Vitest for project-data checks
- Netlify static deployment

There is intentionally no client-side router or SPA fallback in Phase 1. Future project pages can be added as real Vite HTML entry points or alongside a router when their content exists.

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deployment

Netlify runs `npm run build` and publishes `dist`. The configuration does not contain redirects, custom-domain changes or subdomain rules, so it remains isolated from `james.sharing.snugzap.com` and other DNS routing.

## Content structure

Project metadata lives in `src/projects.ts`. An optional `href`, link label and external-link flag are ready for verified public project destinations as they become available.

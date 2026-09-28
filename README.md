# Snugzap

Snugzap is the public home for James' independent software, games and experiments: [snugzap.com](https://snugzap.com/).

It gathers practical software, thoughtful tools, playable worlds and preserved experiments in one calm place. The homepage is a focused studio page, not a generic developer portfolio or a product-marketing site.

## Stack

- Vite and TypeScript
- Plain semantic HTML and CSS
- Vitest for project-data checks
- Netlify static deployment

The site stays a lightweight static build. There is no client-side router, CMS or UI framework. Project detail pages are not part of this homepage.

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

## Project catalogue

Curated project data lives in `src/projects.ts`. The homepage groups that catalogue by meaning, not by list position:

- **Featured work** — projects marked `featured`
- **More projects** — active work that is neither featured nor archived
- **Archive & future** — projects marked `archived`

Lifecycle labels describe where a project is, such as `Windows release · Active development` or `Dormant · Future revival`. They intentionally avoid fast-changing patch versions. Exact releases belong on the project or release destination.

Only approved public project destinations should be linked. Do not add localhost addresses, QA revisions, deploy previews, admin consoles, private service URLs or other temporary environments.

## Deployment

Netlify runs `npm run build` and publishes `dist`. The configuration does not contain redirects, custom-domain changes or subdomain rules, so it remains isolated from `james.sharing.snugzap.com` and other DNS routing.

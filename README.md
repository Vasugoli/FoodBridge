# FoodBridge

FoodBridge is a Next.js application that connects food donators with distributors to reduce waste and help communities.

This repository is scaffolded from a Next starter and includes UI components, a simple demo dashboard for different user roles.

## Quick facts

- Framework: Next.js 15 (App Router)
- React: 18
- Styling: Tailwind CSS
- Languages: TypeScript
- Dev port (default in package.json): 9002

## What you'll find here

- `src/app` — application routes and pages (App Router)
- `src/components` — UI components and shared layout
- `src/hooks`, `src/lib` — helpers, placeholder data, and types

## Prerequisites

- Node.js 18+ (v22.x is shown in this project)
- npm (or yarn/pnpm)

## Local development — run the app

1. Install dependencies

```bash
npm install
```

1. Start the dev server

```bash
npm run dev
```

The app will run on `http://localhost:9002` by default (see `package.json` script).

1. Visit common pages

- Home: `/`
- Dashboard (role demo): `/dashboard` or `/dashboard?role=admin` or `/dashboard?role=distributor`

## Build and start (production)

```bash
npm run build
npm start
```

```bash
npm uninstall firebase
```

## Troubleshooting

- Hydration warning on dev overlay / head:
  - The project suppresses hydration warnings on the `<head>` and `<body>` in `src/app/layout.tsx` to avoid dev-overlay injection mismatches. If you see hydration errors, try disabling browser extensions and restart the dev server.

- Runtime error: `searchParams.role` used synchronously
  - Ensure page components that use `searchParams` are `async` and `await searchParams` (see `src/app/dashboard/page.tsx`).

- Audit / dependency warnings
  - You may see deprecation or vulnerability warnings from npm (transitive deps like `inflight`, `rimraf`, `glob`). Run:

```bash
npm audit
npm audit fix
```

If issues remain that require breaking upgrades, review `npm outdated` and update the top-level packages carefully.

## Tests / Typecheck / Lint

```bash
npm run typecheck
npm run lint
```

## Useful commands

- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Start: `npm start`
- GenKit dev: `npm run genkit:dev`

## Next steps and notes

If you'd like, I can:

- Remove unused deps like `firebase` and `@genkit-ai/*` packages and run `npm install` to update the lockfile.
- Add a small README under `src/ai/` describing how to run GenKit flows.

If you want me to apply either change, tell me which and I'll update the repository and run a quick validation (typecheck / dev start) for you.

---
Generated guide — FoodBridge

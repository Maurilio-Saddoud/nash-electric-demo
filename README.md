# Nash Electric Inventory Demo

QR-based van inventory demo, configured for GitHub Pages static hosting.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Run:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Generate QR Codes

Use `QR_BASE_URL` in `.env.local` (or default localhost):

```bash
npm run generate:qr
```

Output goes to `qr-output/`.

## GitHub Pages Deployment

This repo is set up to deploy automatically with GitHub Actions:

- Workflow: `.github/workflows/deploy-pages.yml`
- Static output: `out/` (`next.config.ts` uses `output: "export"`)

### One-time GitHub setup

1. Push this repository to GitHub.
2. In GitHub: `Settings > Pages`.
3. Set `Build and deployment` source to `GitHub Actions`.
4. Push to `main` (or `master`) to trigger deployment.

### Project pages base path

For `https://<user>.github.io/<repo>/`, base path is auto-detected in CI from `GITHUB_REPOSITORY`.

If you need a custom base path, set:

- `NEXT_PUBLIC_BASE_PATH` (repository variable or workflow env), e.g. `/inventory`.

## Static Hosting Note

GitHub Pages cannot run Next.js route handlers. Existing API route handlers were moved to:

- `server/api/items/route.ts`
- `server/api/trucks/route.ts`
- `server/api/upload/route.ts`

They are preserved for future server-hosted deployment (Vercel, Supabase functions, etc.).

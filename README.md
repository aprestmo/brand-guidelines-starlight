# Brand guidelines

A Starlight documentation site with TinaCMS editing.

## Content

Documentation lives in `src/content/docs/`:

- Markdown files are editable in TinaCMS with title, description, and rich-text body fields.
- `index.mdx` is the documentation home. Its hero and next-step cards are structured Tina fields; its MDX component wrapper remains source-controlled.
- Starlight continues to generate the public documentation routes from these files.

## Local editing

Run the combined TinaCMS and Astro development server:

```sh
pnpm dev
```

Open `http://localhost:4321/admin/` to edit content. Saving updates the Markdown or MDX source file; regular documentation bodies also update in the Tina preview.

TinaCMS generates `tina/__generated__/` and `public/admin/`; neither directory is committed. `pnpm build` uses Tina’s local content API without TinaCloud validation for a credential-free local build.

For a TinaCloud deployment, provide `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` and run `pnpm build:cloud`.

## Deployment

This project is set up to deploy to [AWS Amplify Hosting](https://aws.amazon.com/amplify/) using the community [`astro-aws-amplify`](https://github.com/alexnguyennz/astro-aws-amplify) adapter (`output: 'server'` in `astro.config.mjs`), the same platform the original TinaCMS site was hosted on.

1. Run `pnpm add astro-aws-amplify` locally once to install the adapter and update `pnpm-lock.yaml` (it's declared in `package.json`, but the lockfile needs regenerating on a real install — this repo's sandboxed environment couldn't reach the npm registry to do it). Commit the updated lockfile.
2. In the Amplify Console, create a Hosting app connected to this repository. Amplify picks up the `amplify.yml` at the repo root automatically.
3. Amplify defaults to Node.js 16, which this adapter doesn't support (it needs Node 22.12+). Under **App settings → Environment variables**, add:
   ```
   _CUSTOM_IMAGE=amplify:al2023
   ```
4. Deploy. Amplify builds with `pnpm run build` (which runs `tinacms build --local --skip-cloud-checks -c "astro build"`) and serves the `.amplify-hosting` output directory.

Known limitation: Starlight's built-in 404 page is prerendered to static HTML by default, but Amplify's SSR catch-all fallback expects a server-rendered 404 to work correctly (see the adapter's [404 Pages](https://github.com/alexnguyennz/astro-aws-amplify#404-pages) note). Genuinely broken links may not show Starlight's styled 404 page until this is addressed with a custom server-rendered `404.astro`.

## Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`             | Installs dependencies                            |
| `pnpm dev`             | Starts TinaCMS and Astro at `localhost:4321`     |
| `pnpm build`           | Generates TinaCMS and builds the production site |
| `pnpm build:cloud`     | Builds against TinaCloud for deployment          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

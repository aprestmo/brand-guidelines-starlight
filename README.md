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

// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import starlight from '@astrojs/starlight';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

// https://astro.build/config
export default defineConfig({
	site: process.env.SITE_URL || 'http://localhost:4321',
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	server: {
		host: true,
		port: Number(process.env.PORT) || 4321,
	},
	integrations: [
		starlight({
      title: 'Brand Guidelines',
      locales: {
        root: {
          label: 'Norsk bokmål',
          lang: 'nb-NO',
        }
      },
			components: {
				MarkdownContent: './src/components/tina/MarkdownContent.astro',
				PageTitle: './src/components/tina/PageTitle.astro',
			},
			sidebar: [
				{
					label: 'Merkevaremanual',
					items: [
						// Same order as the nav config in the original TinaCMS site.
						{ slug: 'merkevarestrategi' },
						{ slug: 'logo' },
						{ slug: 'farger' },
						{ slug: 'typografi' },
						{ slug: 'grid' },
						{ slug: 'annonse' },
						{ slug: 'some' },
						{ slug: 'produktdesign' },
						{ slug: 'motion' },
						{ slug: 'video-og-bildemaner' },
					],
				},
			],
		}),
		tina(),
	],
	vite: {
		plugins: [tinaAdminDevRedirect()],
		ssr: {
			// Docker runtime ships only `dist/` (no node_modules). Bundle Tina
			// packages so `/tina-island/*` can resolve `tinacms/dist/client`
			// without a runtime dependency install.
			noExternal: ['@tinacms/astro', '@tinacms/bridge', 'tinacms'],
		},
	},
});

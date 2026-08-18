// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import starlight from '@astrojs/starlight';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
const tinaEnabled = process.env.TINA_ENABLED === 'true';

// https://astro.build/config
export default defineConfig({
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
			components: tinaEnabled
				? {
						MarkdownContent: './src/components/tina/MarkdownContent.astro',
					}
				: undefined,
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
		...(tinaEnabled ? [tina()] : []),
	],
	vite: {
		define: {
			__TINA_ENABLED__: JSON.stringify(tinaEnabled),
		},
		...(tinaEnabled
			? {
					plugins: [tinaAdminDevRedirect()],
					ssr: {
						noExternal: ['@tinacms/astro', '@tinacms/bridge'],
					},
				}
			: {}),
	},
});

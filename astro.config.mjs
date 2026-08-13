// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import starlight from '@astrojs/starlight';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	integrations: [
		starlight({
			title: 'Brand Guidelines',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			components: {
				MarkdownContent: './src/components/tina/MarkdownContent.astro',
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
						{ slug: 'video-og-bildemanr' },
					],
				},
			],
		}),
		tina(),
	],
	vite: {
		plugins: [tinaAdminDevRedirect()],
		ssr: {
			noExternal: ['@tinacms/astro', '@tinacms/bridge'],
		},
	},
});

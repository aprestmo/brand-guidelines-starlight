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
			title: 'My Docs',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			components: {
				MarkdownContent: './src/components/tina/MarkdownContent.astro',
			},
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					items: [{ autogenerate: { directory: 'reference' } }],
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

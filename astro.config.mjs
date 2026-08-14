// @ts-check
import { defineConfig } from 'astro/config';
import awsAmplify from 'astro-aws-amplify';
import starlight from '@astrojs/starlight';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: awsAmplify({
		// Starlight pages are prerendered to static HTML by default (even in "server"
		// output mode), but Amplify routes every path to the SSR compute unless told
		// otherwise. These rewrite rules point known static paths back at their static
		// files. See: https://github.com/alexnguyennz/astro-aws-amplify#limitations
		customRules: [
			{ source: '/', target: '/index.html', status: '200' },
			// Covers every top-level doc page, e.g. /logo/, /farger/, /motion/.
			{ source: '/<a>/', target: '/<a>/index.html', status: '200' },
			// Covers nested pages, e.g. /guides/example/, /reference/example/.
			{ source: '/<a>/<b>/', target: '/<a>/<b>/index.html', status: '200' },
		],
	}),
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

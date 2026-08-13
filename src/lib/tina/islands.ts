// @ts-nocheck Generated Tina query types are refreshed by `tinacms build`.
import type { IslandRegistry } from '@tinacms/astro/experimental';
import DocBody from '../../components/tina/DocBody.astro';
import HomeCardsBody from '../../components/tina/HomeCardsBody.astro';
import { getDoc, getDocsHome } from './data';

export const islands: IslandRegistry = {
	doc: {
		fetch: (_request, params) => getDoc(params.get('slug') ?? ''),
		component: DocBody,
		wrapper: { tag: 'div' },
		propsFromData: (result) => ({
			data: result.data?.doc,
		}),
	},
	docsHome: {
		fetch: () => getDocsHome(),
		component: HomeCardsBody,
		wrapper: { tag: 'div' },
		propsFromData: (result) => ({
			data: result.data?.docsHome,
		}),
	},
};

// @ts-nocheck Generated Tina query types are refreshed by `tinacms build`.
import type { IslandRegistry } from '@tinacms/astro/experimental';
import DocBody from '../../components/tina/DocBody.astro';
import DocTitle from '../../components/tina/DocTitle.astro';
import HomeCardsBody from '../../components/tina/HomeCardsBody.astro';
import { getDoc, getDocsHome } from './data';

// #region agent log
fetch('http://127.0.0.1:7625/ingest/679c984d-a08c-479d-aa2b-e4907b8ad5ba',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f1bf7a'},body:JSON.stringify({sessionId:'f1bf7a',runId:'title-fix',hypothesisId:'A',location:'src/lib/tina/islands.ts:module',message:'islands module evaluated',data:{hasDocBody:typeof DocBody !== 'undefined',hasDocTitle:typeof DocTitle !== 'undefined',hasHome:typeof HomeCardsBody !== 'undefined'},timestamp:Date.now()})}).catch(()=>{});
// #endregion

export const islands: IslandRegistry = {
	docTitle: {
		fetch: (_request, params) => getDoc(params.get('slug') ?? ''),
		component: DocTitle,
		wrapper: { tag: 'div' },
		propsFromData: (result) => ({
			data: result.data?.doc,
		}),
	},
	doc: {
		fetch: (_request, params) => {
			const slug = params.get('slug') ?? '';
			// #region agent log
			fetch('http://127.0.0.1:7625/ingest/679c984d-a08c-479d-aa2b-e4907b8ad5ba',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f1bf7a'},body:JSON.stringify({sessionId:'f1bf7a',runId:'title-fix',hypothesisId:'B',location:'src/lib/tina/islands.ts:doc.fetch',message:'doc island fetch',data:{slug},timestamp:Date.now()})}).catch(()=>{});
			// #endregion
			return getDoc(slug);
		},
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

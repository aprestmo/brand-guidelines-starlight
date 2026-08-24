import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../../tina/__generated__/client';
export const getDoc = async (relativePath: string) => {
	// #region agent log
	fetch('http://127.0.0.1:7625/ingest/679c984d-a08c-479d-aa2b-e4907b8ad5ba',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f1bf7a'},body:JSON.stringify({sessionId:'f1bf7a',runId:'title-fix',hypothesisId:'B',location:'src/lib/tina/data.ts:getDoc:entry',message:'getDoc start',data:{relativePath,hasToken:Boolean(process.env.TINA_TOKEN),hasClientId:Boolean(process.env.NEXT_PUBLIC_TINA_CLIENT_ID)},timestamp:Date.now()})}).catch(()=>{});
	// #endregion
	try {
		const result = await requestWithMetadata(client.queries.doc({ relativePath: `${relativePath}.mdx` }), {
			priority: 'primary',
		});
		// #region agent log
		fetch('http://127.0.0.1:7625/ingest/679c984d-a08c-479d-aa2b-e4907b8ad5ba',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f1bf7a'},body:JSON.stringify({sessionId:'f1bf7a',runId:'title-fix',hypothesisId:'B',location:'src/lib/tina/data.ts:getDoc:exit',message:'getDoc done',data:{relativePath,hasDoc:Boolean(result?.data && 'doc' in result.data && result.data.doc),queryLen:result?.query?.length ?? 0,id:result?.id ?? null},timestamp:Date.now()})}).catch(()=>{});
		// #endregion
		return result;
	} catch (error) {
		const err = error instanceof Error ? { name: error.name, message: error.message } : { message: String(error) };
		// #region agent log
		fetch('http://127.0.0.1:7625/ingest/679c984d-a08c-479d-aa2b-e4907b8ad5ba',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f1bf7a'},body:JSON.stringify({sessionId:'f1bf7a',runId:'title-fix',hypothesisId:'B',location:'src/lib/tina/data.ts:getDoc:catch',message:'getDoc threw',data:{relativePath,err},timestamp:Date.now()})}).catch(()=>{});
		// #endregion
		throw error;
	}
};

export const getDocsHome = () =>
	requestWithMetadata(client.queries.docsHome({ relativePath: 'index.mdx' }), {
		priority: 'primary',
	});


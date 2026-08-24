import type { APIRoute } from 'astro';

export const prerender = false;

export const ALL: APIRoute = async (ctx) => {
	// #region agent log
	fetch('http://127.0.0.1:7625/ingest/679c984d-a08c-479d-aa2b-e4907b8ad5ba',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f1bf7a'},body:JSON.stringify({sessionId:'f1bf7a',runId:'title-fix',hypothesisId:'A',location:'src/pages/tina-island/[name].ts:handler',message:'island route entered',data:{method:ctx.request.method,pathname:ctx.url.pathname,search:ctx.url.search,name:ctx.params.name,contentType:ctx.request.headers.get('content-type'),prime:ctx.request.headers.get('x-tina-prime') ?? ctx.request.headers.get('tina-prime'),hasToken:Boolean(process.env.TINA_TOKEN),hasClientId:Boolean(process.env.NEXT_PUBLIC_TINA_CLIENT_ID)},timestamp:Date.now()})}).catch(()=>{});
	// #endregion
	try {
		const { experimental_createIslandRoute } = await import('@tinacms/astro/experimental');
		const { islands } = await import('../../lib/tina/islands');
		// #region agent log
		fetch('http://127.0.0.1:7625/ingest/679c984d-a08c-479d-aa2b-e4907b8ad5ba',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f1bf7a'},body:JSON.stringify({sessionId:'f1bf7a',runId:'title-fix',hypothesisId:'A',location:'src/pages/tina-island/[name].ts:loaded',message:'island modules loaded',data:{islandKeys:Object.keys(islands)},timestamp:Date.now()})}).catch(()=>{});
		// #endregion
		const handler = experimental_createIslandRoute(islands);
		const res = await handler(ctx);
		// #region agent log
		fetch('http://127.0.0.1:7625/ingest/679c984d-a08c-479d-aa2b-e4907b8ad5ba',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f1bf7a'},body:JSON.stringify({sessionId:'f1bf7a',runId:'title-fix',hypothesisId:'C',location:'src/pages/tina-island/[name].ts:response',message:'island handler returned',data:{status:res.status,ok:res.ok},timestamp:Date.now()})}).catch(()=>{});
		// #endregion
		return res;
	} catch (error) {
		const err = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack?.slice(0, 1500) } : { message: String(error) };
		// #region agent log
		fetch('http://127.0.0.1:7625/ingest/679c984d-a08c-479d-aa2b-e4907b8ad5ba',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'f1bf7a'},body:JSON.stringify({sessionId:'f1bf7a',runId:'title-fix',hypothesisId:'A',location:'src/pages/tina-island/[name].ts:catch',message:'island route threw',data:{err},timestamp:Date.now()})}).catch(()=>{});
		// #endregion
		throw error;
	}
};

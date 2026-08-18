import type { APIRoute } from 'astro';

export const prerender = false;

declare const __TINA_ENABLED__: boolean;

export const ALL: APIRoute = async (context) => {
	if (!__TINA_ENABLED__) {
		return new Response(null, { status: 404 });
	}

	const [{ experimental_createIslandRoute }, { islands }] = await Promise.all([
		import('@tinacms/astro/experimental'),
		import('../../lib/tina/islands'),
	]);

	return experimental_createIslandRoute(islands).ALL(context);
};

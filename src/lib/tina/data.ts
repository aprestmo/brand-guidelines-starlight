import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../../tina/__generated__/client';
export const getDoc = (relativePath: string) =>
	requestWithMetadata(client.queries.doc({ relativePath: `${relativePath}.mdx` }), {
		priority: 'primary',
	});

export const getDocsHome = () =>
	requestWithMetadata(client.queries.docsHome({ relativePath: 'index.mdx' }), {
		priority: 'primary',
	});

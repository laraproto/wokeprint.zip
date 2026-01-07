import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { RequestHandler } from './$types';
import { appRouter } from '$lib/server/router';

export const fallback: RequestHandler = ({ request, locals }) => {
	return fetchRequestHandler({
		endpoint: '/trpc',
		req: request,
		router: appRouter,
		createContext: () => ({
			user: locals.user,
			session: locals.session
		})
	});
};

import type { RequestHandler } from './$types';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '$lib/server/router';

export const fallback: RequestHandler = ({ locals, request }) => {
	return fetchRequestHandler({
		endpoint: '/trpc',
		router: appRouter,
		req: request,
		createContext: () => ({
			user: locals.user,
			session: locals.session
		})
	});
};

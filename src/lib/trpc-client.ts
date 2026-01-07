import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/router';

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: '/trpc'
		})
	]
});

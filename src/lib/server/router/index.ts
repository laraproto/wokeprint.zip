import { router, publicProcedure, authedProcedure } from '../trpc';

export const appRouter = router({
	hello: publicProcedure.query(({ ctx }) => {
		return `Hello ${ctx.user?.name ?? 'World'}`;
	}),
	canAdmin: authedProcedure.query(({ ctx }) => {
		return ctx.user!.isAdmin;
	})
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

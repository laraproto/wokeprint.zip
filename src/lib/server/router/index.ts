import { router, publicProcedure, authedProcedure } from '../trpc';
import { adminRouter } from './admin';
import { userRouter } from './user';

export const appRouter = router({
	hello: publicProcedure.query(({ ctx }) => {
		return `Hello ${ctx.user?.name ?? 'World'}`;
	}),
	canAdmin: authedProcedure.query(({ ctx }) => {
		return ctx.user!.isAdmin;
	}),
	admin: adminRouter,
	user: userRouter
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

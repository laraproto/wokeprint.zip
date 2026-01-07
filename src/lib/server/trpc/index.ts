import { initTRPC, TRPCError } from '@trpc/server';
import type { schema } from '../db';

interface TRPCContext {
	user: typeof schema.user.$inferSelect | null;
	session: typeof schema.session.$inferSelect | null;
}

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const authedProcedure = publicProcedure.use(async (opts) => {
	const { ctx } = opts;

	if (!ctx.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User is not logged in' });
	}

	return opts.next({
		ctx
	});
});

export const adminProcedure = authedProcedure.use(async (opts) => {
	const { ctx } = opts;

	if (!ctx.user!.isAdmin) {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'User is not an admin' });
	}

	return opts.next({
		ctx
	});
});

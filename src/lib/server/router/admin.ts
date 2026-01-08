import z from 'zod';
import { router, adminProcedure } from '../trpc';
import { db, schema } from '../db';
import { and, eq } from 'drizzle-orm';
import { buildOctoDNSConfig } from '../octodns';

export const adminRouter = router({
	approveDomain: adminProcedure
		.input(
			z.object({
				domainId: z.uuidv7(),
				userId: z.uuidv7()
			})
		)
		.mutation(async ({ input }) => {
			try {
				const updatedDomain = await db
					.update(schema.domains)
					.set({
						approved: true
					})
					.where(
						and(eq(schema.domains.id, input.domainId), eq(schema.domains.ownerId, input.userId))
					)
					.returning();

				if (updatedDomain.length === 0) {
					return {
						success: false,
						message: 'Domain not found or could not be approved'
					};
				}

				await buildOctoDNSConfig();

				return {
					success: true,
					message: 'Domain approved successfully',
					domain: updatedDomain[0]!
				};
			} catch (err) {
				console.error(err);
				return {
					success: false,
					message: 'Something went wrong with approving or I broke something again'
				};
			}
		})
});

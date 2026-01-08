import z from 'zod';
import { router, authedProcedure } from '../trpc';
import { db, schema } from '../db';
import { eq, and } from 'drizzle-orm';
import { buildOctoDNSConfig } from '../octodns';

export const userRouter = router({
	requestDomain: authedProcedure
		.input(
			z.object({
				subdomain: z.string().min(3).max(32),
				records: z.array(
					z.object({
						type: z
							.enum(['A', 'AAAA', 'TXT', 'SRV', 'CNAME'])
							.refine((val) => ['A', 'AAAA', 'TXT', 'SRV', 'CNAME'].includes(val), {
								error: 'Invalid record type'
							}),
						value: z.array(z.string()).min(1)
					})
				)
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const existingDomain = await db.query.domains.findFirst({
					where: eq(schema.domains.subdomain, input.subdomain)
				});

				if (existingDomain) {
					return {
						success: false,
						message: 'Subdomain already exists'
					};
				}

				const newDomain = await db
					.insert(schema.domains)
					.values({
						subdomain: input.subdomain,
						ownerId: ctx.user!.id
					})
					.returning();

				let previousRecordType: string | null = null;
				let previousRecordValue: string[] | null = null;
				for await (const record of input.records) {
					if (
						record.type === previousRecordType &&
						JSON.stringify(record.value) === JSON.stringify(previousRecordValue)
					)
						continue;

					await db.insert(schema.domainRecords).values({
						subdomainId: newDomain[0].id,
						type: record.type,
						value: record.value
					});

					previousRecordType = record.type;
					previousRecordValue = record.value;
				}

				return {
					success: true,
					message: 'Domain request submitted successfully',
					domain: newDomain[0]
				};
			} catch (err) {
				console.error(err);
				return {
					success: false,
					message: 'An error occurred while processing your request'
				};
			}
		}),
	getDomain: authedProcedure.input(z.uuidv7()).query(async ({ ctx, input }) => {
		try {
			const domain = await db.query.domains.findFirst({
				where: and(eq(schema.domains.id, input), eq(schema.domains.ownerId, ctx.user!.id)),
				with: {
					records: true
				}
			});

			if (!domain) {
				return {
					success: false,
					message: 'Domain not found',
					domain: null
				};
			}

			return {
				success: true,
				domain
			};
		} catch (err) {
			console.error(err);
			return {
				success: false,
				message: 'Prod blew up',
				domain: null
			};
		}
	}),
	getDomains: authedProcedure.query(async ({ ctx }) => {
		try {
			const domains = await db.query.domains.findMany({
				where: eq(schema.domains.ownerId, ctx.user!.id)
			});

			return {
				success: true,
				domains
			};
		} catch (err) {
			console.error(err);
			return {
				success: false,
				message: 'Something went wrong finding your domains or the database is dead',
				domains: null
			};
		}
	}),
	deleteRule: authedProcedure
		.input(
			z.object({
				domainId: z.uuidv7(),
				recordId: z.uuidv7()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const domain = await db.query.domains.findFirst({
					where: and(
						eq(schema.domains.id, input.domainId),
						eq(schema.domains.ownerId, ctx.user!.id)
					)
				});

				if (!domain) {
					return {
						success: false,
						message: 'Domain not found'
					};
				}

				const deleteRecord = await db
					.delete(schema.domainRecords)
					.where(
						and(
							eq(schema.domainRecords.id, input.recordId),
							eq(schema.domainRecords.subdomainId, input.domainId)
						)
					)
					.returning();

				if (deleteRecord.length === 0) {
					return {
						success: false,
						message: 'Record not found or could not be deleted'
					};
				}

				if (domain.approved) {
					await buildOctoDNSConfig();
				}

				return {
					success: true,
					message: 'Record deleted successfully'
				};
			} catch (err) {
				console.error(err);
				return {
					success: false,
					message: 'Failed to delete record'
				};
			}
		}),
	createRule: authedProcedure
		.input(
			z.object({
				domainId: z.uuidv7(),
				type: z
					.enum(['A', 'AAAA', 'TXT', 'SRV', 'CNAME'])
					.refine((val) => ['A', 'AAAA', 'TXT', 'SRV', 'CNAME'].includes(val), {
						error: 'Invalid record type'
					}),
				value: z.array(z.string()).min(1)
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const domain = await db.query.domains.findFirst({
					where: and(
						eq(schema.domains.id, input.domainId),
						eq(schema.domains.ownerId, ctx.user!.id)
					),
					with: {
						records: true
					}
				});

				if (!domain) {
					return {
						success: false,
						message: 'Domain not found'
					};
				}

				for await (const record of domain.records) {
					if (record.type === input.type) {
						return {
							success: false,
							message: `Record of type ${input.type} already exists for this domain, use comma delimited values on the first record instead`
						};
					}
				}

				const insertRecord = await db
					.insert(schema.domainRecords)
					.values({
						subdomainId: input.domainId,
						type: input.type,
						value: input.value
					})
					.returning();

				if (insertRecord.length === 0) {
					return {
						success: false,
						message: 'Record could not be created'
					};
				}

				if (domain.approved) {
					await buildOctoDNSConfig();
				}

				return {
					success: true,
					message: 'Record created successfully'
				};
			} catch (err) {
				console.error(err);
				return {
					success: false,
					message: 'Failed to create record or I broke something again'
				};
			}
		}),
	deleteSubdomain: authedProcedure
		.input(
			z.object({
				domainId: z.uuidv7()
			})
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const domain = await db.query.domains.findFirst({
					where: and(
						eq(schema.domains.id, input.domainId),
						eq(schema.domains.ownerId, ctx.user!.id)
					)
				});

				if (!domain) {
					return {
						success: false,
						message: 'Domain not found'
					};
				}

				const deleteDomain = await db
					.delete(schema.domains)
					.where(eq(schema.domains.id, input.domainId))
					.returning();

				if (deleteDomain.length === 0) {
					return {
						success: false,
						message: 'Domain not found or could not be deleted'
					};
				}

				if (domain.approved) {
					await buildOctoDNSConfig();
				}

				return {
					success: true,
					message: 'Domain deleted successfully'
				};
			} catch (err) {
				console.error(err);
				return {
					success: false,
					message: 'Failed to delete domain'
				};
			}
		})
});

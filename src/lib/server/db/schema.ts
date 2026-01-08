import { relations } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { user } from './auth-schema';

export const domains = sqliteTable('domains', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => Bun.randomUUIDv7())
		.unique(),
	subdomain: text('subdomain').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	approved: integer('approved', { mode: 'boolean' }).default(false).notNull(),
	ownerId: text('owner_id').notNull()
});

export const domainRecords = sqliteTable('domain_records', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => Bun.randomUUIDv7())
		.unique(),
	subdomainId: text('subdomain_id').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
	type: text('type', { enum: ['A', 'AAAA', 'TXT', 'SRV', 'CNAME'] }).notNull(),
	value: text('value', { mode: 'json' }).notNull().$type<string[]>()
});

export const domainRelations = relations(domains, ({ one, many }) => ({
	owner: one(user, {
		fields: [domains.ownerId],
		references: [user.id]
	}),
	records: many(domainRecords)
}));

export const domainRecordRelations = relations(domainRecords, ({ one }) => ({
	subdomain: one(domains, {
		fields: [domainRecords.subdomainId],
		references: [domains.id]
	})
}));

export * from './auth-schema';

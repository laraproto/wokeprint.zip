import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

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
	type: text('type', { enum: [] }).notNull(),
	value: text('value').notNull()
});

export * from './auth-schema';

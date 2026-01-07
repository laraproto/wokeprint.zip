import { drizzle } from 'drizzle-orm/libsql';
//import { sql } from 'bun';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

export const makeBetterAuthHappy = createClient({
	url: env.DATABASE_URL
});

export const db = drizzle({ client: makeBetterAuthHappy, schema });

export { schema };

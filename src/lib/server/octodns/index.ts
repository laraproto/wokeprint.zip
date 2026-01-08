import base from '$lib/base.yml?raw' with { type: 'text' };
import * as fs from 'node:fs';

import { db, schema } from '../db';
import { eq } from 'drizzle-orm';
import z from 'zod';
import { YAML, spawn } from 'bun';
import { env } from '$env/dynamic/private';

export const OCTODNS_CONFIG_PATH = '/tmp/octodns.yml';

fs.writeFileSync(OCTODNS_CONFIG_PATH, base);
fs.mkdirSync('/tmp/octodns-config', { recursive: true });

const octodnsConfigSchema = z.record(
	z.string(),
	z.array(
		z.object({
			type: z.enum(['A', 'AAAA', 'TXT', 'SRV', 'CNAME']),
			values: z.array(z.string()).min(1)
		})
	)
);

type OctoDNSConfig = z.infer<typeof octodnsConfigSchema>;

export const buildOctoDNSConfig = async () => {
	const domains = await db.query.domains.findMany({
		where: eq(schema.domains.approved, true),
		with: {
			records: true
		}
	});

	const config: OctoDNSConfig = {};

	for await (const domain of domains) {
		config[domain.subdomain] = domain.records.map((record) => ({
			type: record.type,
			values: record.value
		}));
	}

	const parsedConfig = octodnsConfigSchema.safeParse(config);

	if (!parsedConfig.success) {
		console.error('Invalid OctoDNS config:', parsedConfig.error);
		throw new Error('Failed to build OctoDNS config');
	}

	const yamlified = YAML.stringify(parsedConfig.data);

	await fs.promises.writeFile('/tmp/octodns-config/wokeprint.zip.yaml', yamlified);

	spawn({
		cmd: ['octodns-sync', '--config-file', OCTODNS_CONFIG_PATH, '--doit'],
		stdout: 'inherit',
		stderr: 'inherit',
		cwd: '/tmp',
		env: {
			...env
		}
	});
};

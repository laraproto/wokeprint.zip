import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

export const _requestDomainSchema = z.object({
	subdomain: z.string().min(3).max(32),
	records: z.array(
		z.object({
			type: z
				.enum(['A', 'AAAA', 'TXT', 'SRV', 'CNAME'])
				.refine((val) => ['A', 'AAAA', 'TXT', 'SRV', 'CNAME'].includes(val), {
					error: 'Invalid record type'
				}),
			value: z.string().min(1)
		})
	)
});

export const load = async () => {
	const form = await superValidate(zod4(_requestDomainSchema));

	return { form };
};

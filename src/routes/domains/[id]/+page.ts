import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

export const _recordSchema = z.object({
	type: z
		.enum(['A', 'AAAA', 'TXT', 'SRV', 'CNAME'])
		.refine((val) => ['A', 'AAAA', 'TXT', 'SRV', 'CNAME'].includes(val), {
			error: 'Invalid record type'
		}),
	value: z.string().min(1)
});

export const load = async ({ params }) => {
	const formEdit = await superValidate(zod4(_recordSchema));
	const formCreate = await superValidate(zod4(_recordSchema));

	return { id: params.id, formEdit, formCreate };
};

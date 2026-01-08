<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { trpcClient } from '$lib/trpc-client';
	import { superForm, setMessage } from 'sveltekit-superforms';
	import { CirclePlus } from '@lucide/svelte';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { _requestDomainSchema } from './+page';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	const { form, errors, message, constraints, enhance } = superForm((() => data.form)(), {
		SPA: true,
		validators: zod4(_requestDomainSchema),
		async onUpdate({ form }) {
			if (!form.valid) {
				toast.error('Form is invalid. Please check your input.');
			}

			const records = form.data.records.map((record) => ({
				type: record.type,
				value: record.value.split(',').map((v) => v.trim())
			}));

			const result = await trpcClient.user.requestDomain.mutate({
				subdomain: form.data.subdomain,
				records
			});

			if (result.success) {
				setMessage(form, 'Domain request submitted successfully.');
				toast.success('Domain request submitted successfully.');

				setTimeout(() => {
					goto('/domains');
				}, 1500);
			} else {
				setMessage(form, result.message || 'Failed to submit domain request.');
				toast.error(result.message || 'Failed to submit domain request.');
			}
		}
	});

	const recordTypes = ['A', 'AAAA', 'CNAME', 'TXT', 'SRV'];
</script>

<div class="container flex justify-center pb-4">
	<Card.Root class="md:w-lg">
		<Card.Header>
			<Card.Title>Add a Domain</Card.Title>
		</Card.Header>
		<Card.Content>
			<form id="request-form" use:enhance>
				<Field.Set>
					<Field.Group>
						<Field.Field>
							<Field.Label for="subdomain">Subdomain</Field.Label>
							<Input
								id="subdomain"
								aria-invalid={$errors.subdomain ? 'true' : undefined}
								bind:value={$form.subdomain}
								{...$constraints.subdomain}
							/>
							{#if $errors.subdomain}<Field.Error>{$errors.subdomain}</Field.Error>{/if}
						</Field.Field>
					</Field.Group>
					<Field.Group>
						<Field.Legend class="flex flex-row items-center justify-between"
							>DNS Records <Button
								onclick={() => {
									console.log($form.records);
									form.update((f) => {
										f.records.push({ type: 'A', value: '' });
										return f;
									});
								}}><CirclePlus /> Add</Button
							></Field.Legend
						>
						{#each $form.records as _, index}
							<Field.Field>
								<Field.Label for="type">Type</Field.Label>
								<Select.Root type="single" bind:value={$form.records[index].type}>
									<Select.Trigger id="department">
										{$form.records[index].type.toUpperCase() || 'Select Record Type'}
									</Select.Trigger>
									<Select.Content>
										{#each recordTypes as recordType (recordType)}
											<Select.Item value={recordType} label={recordType} />
										{/each}
									</Select.Content>
								</Select.Root>
							</Field.Field>
							<Field.Field>
								<Field.Label for="value">Value</Field.Label>
								<Input id="value" bind:value={$form.records[index].value} />
								<Field.Description>Comma delimited values</Field.Description>
							</Field.Field>
						{/each}
					</Field.Group>
				</Field.Set>
			</form>
		</Card.Content>
		<Card.Footer>
			<Button type="submit" form="request-form">Submit Request</Button>
		</Card.Footer>
	</Card.Root>
</div>

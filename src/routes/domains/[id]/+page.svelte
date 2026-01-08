<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { trpcClient } from '$lib/trpc-client';
	import { onMount } from 'svelte';
	import { superForm, setMessage } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { _recordSchema } from './+page';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let domain = $state<{
		id: string;
		subdomain: string;
		createdAt: string | null;
		approved: boolean;
		ownerId: string;
		records: {
			id: string;
			createdAt: string | null;
			subdomainId: string;
			type: 'A' | 'AAAA' | 'TXT' | 'SRV' | 'CNAME';
			value: string[];
		}[];
	} | null>(null);

	let recordCreate = $state<{ type: string; value: string } | null>(null);

	const requestDomain = async () => {
		const result = await trpcClient.user.getDomain.query(data.id);
		if (result.success) {
			domain = result.domain!;
		}
	};

	onMount(async () => {
		await requestDomain();
	});

	const {
		form: formCreate,
		errors: createErrors,
		message: createMessage,
		constraints: createConstraints,
		enhance: createEnhance
	} = superForm((() => data.formCreate)(), {
		SPA: true,
		validators: zod4(_recordSchema),
		async onUpdate({ form }) {
			if (!form.valid) {
				toast.error('Form is invalid. Please check your input.');
			}

			const result = await trpcClient.user.createRule.mutate({
				domainId: domain!.id,
				type: form.data.type,
				value: form.data.value.split(',').map((v) => v.trim())
			});

			if (result.success) {
				recordCreate = null;
				await requestDomain();
				setMessage(form, 'Record created successfully.');
				toast.success('Record created successfully.');
			} else {
				setMessage(form, result.message || 'Failed to submit record.');
				toast.error(result.message || 'Failed to submit record.');
			}
		}
	});

	const recordTypes = ['A', 'AAAA', 'CNAME', 'TXT', 'SRV'];
</script>

<div class="container flex justify-center pb-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>Manage {domain?.subdomain}</Card.Title>
			<Card.Description>DNS Records are weird, good luck</Card.Description>
			<Card.Action>
				<Button
					onclick={() => {
						recordCreate = { type: 'A', value: '' };
					}}>Add Record</Button
				>
			</Card.Action>
		</Card.Header>
		<Card.Content>
			{#if domain}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-25">Type</Table.Head>
							<Table.Head class="w-25">Value</Table.Head>
							<Table.Head>Created</Table.Head>
							<Table.Head class="text-end">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each domain.records as record (record)}
							<Table.Row>
								<Table.Cell class="font-medium">{record.type}</Table.Cell>
								<Table.Cell>{record.value.join(', ')}</Table.Cell>
								<Table.Cell>{record.createdAt}</Table.Cell>
								<Table.Cell class="text-end">
									<Button
										variant="destructive"
										size="sm"
										onclick={async () => {
											await trpcClient.user.deleteRule.mutate({
												domainId: domain!.id,
												recordId: record.id
											});
											await requestDomain();
										}}>Delete</Button
									>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
					<Table.Footer>
						<Table.Row>
							<Table.Cell colspan={3}>Total</Table.Cell>
							<Table.Cell class="text-end">{domain.records.length}</Table.Cell>
						</Table.Row>
					</Table.Footer>
				</Table.Root>
			{/if}
			{#if recordCreate}
				<form id="record-create-form" use:createEnhance class="mt-4">
					<Field.Set>
						<Field.Group>
							<Field.Field>
								<Field.Label for="type">Type</Field.Label>
								<Select.Root type="single" bind:value={$formCreate.type}>
									<Select.Trigger id="department">
										{$formCreate.type.toUpperCase() || 'Select Record Type'}
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
								<Input id="value" bind:value={$formCreate.value} />
								<Field.Description>Comma delimited values</Field.Description>
							</Field.Field>
						</Field.Group>
						<Field.Group class="mt-4 justify-end">
							<Button type="submit" form="record-create-form">Add Record</Button>
						</Field.Group>
					</Field.Set>
				</form>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { trpcClient } from '$lib/trpc-client';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let domains = $state<
		Array<{
			subdomain: string;
			approved: boolean;
			createdAt: string | null;
			id: string;
			ownerId: string;
		}>
	>([]);

	const requestDomains = async () => {
		const result = await trpcClient.admin.listDomains.query({
			showApproved: false
		});
		if (result.success) {
			domains = result.domains!;
		}
	};

	onMount(async () => {
		await requestDomains();
	});
</script>

<div class="container flex justify-center pb-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>Domains</Card.Title>
			<Card.Description>You can only approve</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if domains}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-25">Subdomain</Table.Head>
							<Table.Head class="w-25">Approved</Table.Head>
							<Table.Head>Created</Table.Head>
							<Table.Head class="text-end">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each domains as domain (domain)}
							<Table.Row>
								<Table.Cell class="font-medium">{domain.subdomain}</Table.Cell>
								<Table.Cell>{domain.approved ? 'Yes' : 'No'}</Table.Cell>
								<Table.Cell>{domain.createdAt}</Table.Cell>
								<Table.Cell class="text-end">
									<Button
										variant="secondary"
										size="sm"
										onclick={async () => {
											await trpcClient.admin.approveDomain.mutate({
												domainId: domain.id,
												userId: domain.ownerId
											});
											await requestDomains();
										}}>Approve</Button
									>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
					<Table.Footer>
						<Table.Row>
							<Table.Cell colspan={3}>Total</Table.Cell>
							<Table.Cell class="text-end">{domains?.length}</Table.Cell>
						</Table.Row>
					</Table.Footer>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

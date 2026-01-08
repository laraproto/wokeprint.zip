<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { authClient } from '$lib/auth-client';
	import Button from '$lib/components/ui/button/button.svelte';

	let keys = $state(await authClient.passkey.listUserPasskeys());

	const requestPasskeys = async () => {
		keys = await authClient.passkey.listUserPasskeys();
	};

	let passkeyName = $state('');
</script>

<div class="container flex flex-1 justify-center pb-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>User Settings</Card.Title>
			<Card.Description>This is literally only to add passkeys</Card.Description>
		</Card.Header>
		<Card.Content>
			<Table.Root>
				<Table.Caption>All your passkeys</Table.Caption>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-25">Name</Table.Head>
						<Table.Head class="text-end">Created</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each keys.data as key (key)}
						<Table.Row>
							<Table.Cell class="font-medium">{key.name}</Table.Cell>
							<Table.Cell class="text-end">{key.createdAt}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<Table.Cell colspan={3}>Total</Table.Cell>
						<Table.Cell class="text-end">{keys.data?.length}</Table.Cell>
					</Table.Row>
				</Table.Footer>
			</Table.Root>

			<h2 class="my-4 text-2xl">Add a new passkey</h2>
			<form
				name="add-passkey"
				onsubmit={async (e) => {
					e.preventDefault();
					await authClient.passkey.addPasskey({
						name: passkeyName
					});
					requestPasskeys();
				}}
			>
				<Label for="name" class="mb-2">Passkey Name</Label>
				<Input id="name" type="text" autocomplete="off" bind:value={passkeyName} required />
				<Button type="submit" class="mt-4">Add Passkey</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>

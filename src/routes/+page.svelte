<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { trpcClient } from '$lib/trpc-client';
	import { onMount } from 'svelte';

	onMount(async () => {
		const result = await trpcClient.hello.query();

		console.log(result);
	});
</script>

<div class="container flex flex-1 justify-center overflow-auto px-4 py-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>wokeprint.zip</Card.Title>
			<Card.Description>Get a subdomain on a very dumb top level domain</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="md:w-lg">
				Project for Hack Club Midnight using a domain I don't even remember buying, welcome to
				wokeprint.zip (not to be mistaken with <a
					href="https://blueprint.zip"
					class="text-accent hover:text-primary hover:underline">blueprint.zip</a
				>)
			</p>
			<h1 class="my-2 text-3xl">FAQ</h1>
			<span class="flex flex-col md:w-lg">
				<strong>Why</strong>
				<p>Don't worry about it</p>
				<strong>Why do you have this domain</strong>
				<p>I don't even remember</p>
				<strong>How can I use this</strong>
				<p>
					Sign in with GitHub (you can also add a passkey for sign-in, I just got a yubikey and i'm
					really excited so I added this), and add a subdomain and choose where to point this to
				</p>
				<strong>What are the rules</strong>
				<p>Don't abuse this to where you get my domain put in a client hold</p>
			</span>
		</Card.Content>
	</Card.Root>
</div>

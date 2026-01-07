<script lang="ts">
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { KeyRound } from '@lucide/svelte';
	import { SiGithub } from '@icons-pack/svelte-simple-icons';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import { authClient } from '$lib/auth-client';

	const session = authClient.useSession();
</script>

{#snippet logoutDialog()}
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: 'ghost' })}>Sign out</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Sign out</Dialog.Title>
				<Dialog.Description>
					This prompt is here if you accidentally click the button, it only serves to prevent
					mistakes.
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Dialog.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Dialog.Close>
				<Button
					onclick={() => {
						authClient.signOut();
					}}>Sign me out</Button
				>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/snippet}

<NavigationMenu.Root viewport={false}>
	<NavigationMenu.List>
		{#if $session.data}
			<NavigationMenu.Item>
				<p>You are {$session.data.user.name}</p>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Link href="/domains">Domains</NavigationMenu.Link>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Link href="/settings">Settings</NavigationMenu.Link>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				{@render logoutDialog()}
			</NavigationMenu.Item>
		{:else}
			<p>Sign in with</p>
			<NavigationMenu.Item>
				<Button
					onclick={() => {
						authClient.signIn.social({
							provider: 'github'
						});
					}}><SiGithub /><span>GitHub</span></Button
				>
			</NavigationMenu.Item>
			<p>Or</p>
			<NavigationMenu.Item>
				<Button><KeyRound /><span>Passkey</span></Button>
			</NavigationMenu.Item>
		{/if}
	</NavigationMenu.List>
</NavigationMenu.Root>

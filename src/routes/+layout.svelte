<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import Navbar from '$lib/components/front/Navbar.svelte';

	let { children } = $props();
</script>

<ModeWatcher />
<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="flex min-h-screen flex-col">
	<header class="sticky top-0 z-10 flex h-12 shrink-0 items-end justify-end gap-2 px-4">
		<Navbar />
	</header>
	<main class="flex flex-1 flex-col">
		{@render children?.()}
	</main>
</div>

<script lang="ts">
	import { WalletMultiButton } from '@thewuh/wallet-adapter-svelte-ui';
	import { getWorkspace } from '@thewuh/wallet-adapter-svelte-anchor';
	import { walletStore } from '@thewuh/wallet-adapter-svelte-core';
	import { type DemoProgram } from '$lib/idl';
	import { toast } from 'svelte-sonner';
	import { DemoProgramClient } from '$lib/demo-program';
	import Button from '$lib/components/ui/button/button.svelte';

	$: w = getWorkspace<DemoProgram>();

	$: ({ connection, program, provider } = $w);

	let count: number | string = 0;
	let balance: number | string = 0;

	$: count, balance;

	$: demoProgram = new DemoProgramClient(program, connection);

	const getCount = async () => {
		if (!demoProgram || !$walletStore) return;
		try {
			count = await demoProgram.count($walletStore);
		} catch (e) {
			count = '0';
		}
	};

	const getBalance = async () => {
		try {
			balance = await connection!.getBalance($walletStore.publicKey!);
		} catch {
			throw 'workspace not loaded';
		}
	};

	const createCounter = async () => {
		try {
			console.log('workspace:', $w);
			console.log('demo program:', demoProgram);
			console.log('wallet store:', walletStore);
			if (!demoProgram || !$walletStore) {
				throw new Error('Progarm or Wallet not loaded');
			}
			const txSig = await demoProgram.createCounter($walletStore);
			toast(
				`✅ Transaction successful - https://explorer.solana.com/tx/${txSig}?cluster=devnet`
			);
			// await getBalance().catch()
			await getCount().catch();
		} catch (e: any) {
			toast(`❌ ${e.message || e}`);
		}
	};

	const incrementCount = async () => {
		try {
			if (!demoProgram || !$walletStore) {
				throw new Error('Progarm or Wallet not loaded');
			}
      console.log("provider pubkey:", provider?.publicKey?.toBase58())
			const txSig = await demoProgram.incrementCount($walletStore);
			toast(
				`✅ Transaction successful - https://explorer.solana.com/tx/${txSig}?cluster=devnet`
			);
			// await getBalance().catch()
			await getCount().catch();
		} catch (e: any) {
			toast(`❌ ${e.message || e}`);
		}
	};
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<div class="mt-16 flex flex-col items-center justify-center space-y-8">
	<div class="w-[360px] text-right italic">
		<p class="pr-4 text-lg">Demo app</p>
	</div>

	<h1 class="text-center text-lg">Demo app to show the power of Valet</h1>

	<div class="hidde flex flex-col items-center justify-center p-4 text-center">
		<div class="border p-4">
			<div class="min-w-32 p-2">
				<h1>Counter</h1>
				<h1 class="text-6xl">{count}</h1>
			</div>
			<!-- {#if $walletStore?.connected} -->
				<div class="space-x-2 p-2">
					<Button on:click={incrementCount}>Increment 1x</Button>
				</div>
				<div class="space-x-2 p-2">
					<Button on:click={createCounter}>Create Counter</Button>
					<Button on:click={getBalance}>Get Balance: {balance}</Button>
					<Button on:click={getCount}>Refresh Count</Button>
				</div>
			<!-- {/if} -->
		</div>
	</div>

	<div class="my-2 flex items-center justify-center space-x-2">
		<WalletMultiButton />
	</div>
</div>

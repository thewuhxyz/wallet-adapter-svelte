<script lang="ts">
	import { WalletMultiButton } from '@thewuh/wallet-adapter-svelte-ui';
	import { getWorkspace } from '@thewuh/wallet-adapter-svelte-anchor';
	import { walletStore } from '@thewuh/wallet-adapter-svelte-core';
	import { type DemoProgram } from '$lib/idl';
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/button/button.svelte';
	import { PublicKey } from '@solana/web3.js';

	$: w = getWorkspace<DemoProgram>();

	$: ({ connection, program, provider, systemProgram } = $w);

	let count: number | string = 0;
	let balance: number | string = 0;

	$: count, balance;

	function getCounterAddress(authority: PublicKey) {
		return PublicKey.findProgramAddressSync(
			[Buffer.from('counter'), authority.toBuffer()],
			program.programId
		)[0];
	}

	const getCount = async () => {
		if (!provider?.publicKey) return;
		try {
			count = (await program.account.counter.fetch(getCounterAddress(provider.publicKey)))
				.count;
		} catch (e) {
			count = '0';
		}
	};

	const getBalance = async () => {
		try {
			balance = await connection.getBalance($walletStore.publicKey!);
		} catch {
			throw 'wallet not connected';
		}
	};

	const createCounter = async () => {
		try {
			if (!provider) {
				throw new Error('Provider or Wallet not loaded');
			}
			const txSig = await program.methods
				.createCounter()
				.accountsStrict({
					authority: provider.publicKey,
					counter: getCounterAddress(provider.publicKey!),
					systemProgram: systemProgram.programId
				})
				.rpc();

			toast(
				`✅ Transaction successful - https://explorer.solana.com/tx/${txSig}?cluster=custom`
			);
		} catch (e: any) {
			toast(`❌ ${e.message || e}`);
		}
	};

	const incrementCount = async () => {
		try {
			if (!provider) {
				throw new Error('Provider or Wallet not loaded');
			}
			const txSig = await program.methods
				.incrementCount()
				.accountsStrict({
					authority: provider.publicKey,
					counter: getCounterAddress(provider.publicKey!)
				})
				.rpc();
			toast(
				`✅ Transaction successful - https://explorer.solana.com/tx/${txSig}?cluster=custom`
			);
		} catch (e: any) {
			toast(`❌ ${e.message || e}`);
		}
	};
</script>

<div class="mt-16 flex flex-col items-center justify-center space-y-8">
	<div class="w-[360px] text-right italic">
		<p class="pr-4 text-lg">Demo app</p>
	</div>

  {$walletStore.publicKey?.toBase58() || "not connected"}

	<div class="hidde flex flex-col items-center justify-center p-4 text-center">
		<div class="border p-4">
			<div class="min-w-32 p-2">
				<h1>Counter</h1>
				<h1 class="text-6xl">{count}</h1>
			</div>
			{#if provider}
				<div class="space-x-2 p-2">
					<Button on:click={incrementCount}>Increment 1x</Button>
				</div>
				<div class="space-x-2 p-2">
					<Button on:click={createCounter}>Create Counter</Button>
					<Button on:click={getBalance}>Get Balance: {balance}</Button>
					<Button on:click={getCount}>Refresh Count</Button>
				</div>
			{/if}
		</div>
	</div>

	<div class="my-2 flex items-center justify-center">
		<WalletMultiButton />
	</div>
</div>

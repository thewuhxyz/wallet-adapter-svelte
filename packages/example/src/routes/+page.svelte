<script lang="ts">
	import { WalletMultiButton } from '@thewuh/wallet-adapter-svelte-ui';
	import { getWorkspace } from '@thewuh/wallet-adapter-svelte-anchor';
	import { walletStore } from '@thewuh/wallet-adapter-svelte-core';
	import { type DemoProgram } from '$lib/idl';
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/button/button.svelte';
	import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

	$: w = getWorkspace<DemoProgram>();

	$: ({ connection, program, provider, systemProgram } = $w);

	let count: number | string = '-';
	let balance: number | string = 0;

	$: loading = false;

	$: count, balance;

	$: if (!provider) count = '-';

	function getCounterAddress(authority: PublicKey) {
		return PublicKey.findProgramAddressSync(
			[Buffer.from('counter'), authority.toBuffer()],
			program.programId
		)[0];
	}

	const getCount = async () => {
		try {
			if (!provider?.publicKey) {
				throw new Error('Provider or Wallet not loaded');
			}

			loading = true;
			count = (await program.account.counter.fetch(getCounterAddress(provider.publicKey)))
				.count;
		} catch (e: any) {
			toast.error(`${e.message || e}`);
			count = '-';
		} finally {
			loading = false;
		}
	};

	const getBalance = async () => {
		try {
			if (!provider) {
				throw new Error('Provider or Wallet not loaded');
			}
			balance = (
				(await connection.getBalance($walletStore.publicKey!)) / LAMPORTS_PER_SOL
			).toFixed(5);
		} catch (e: any) {
			toast.error(`${e.message || e}`);
		}
	};

	const createCounter = async () => {
		try {
			if (!provider) {
				throw new Error('Provider or Wallet not loaded');
			}

			const balance = await connection.getBalance(getCounterAddress(provider.publicKey!));

			if (balance !== 0) {
				throw 'counter already created';
			}

			const txSig = await program.methods
				.createCounter()
				.accountsStrict({
					authority: provider.publicKey,
					counter: getCounterAddress(provider.publicKey!),
					systemProgram: systemProgram.programId
				})
				.rpc();

			toast.success('Transaction successful', {
				action: {
					label: 'See Explorer',
					onClick: () =>
						(window.location.href = `https://explorer.solana.com/tx/${txSig}?cluster=devnet`)
				}
			});
		} catch (e: any) {
			toast.error(`${e.message || e}`);
		}
	};

	const incrementCount = async () => {
		try {
			if (!provider) {
				throw new Error('Provider or Wallet not loaded');
			}

			const balance = await connection.getBalance(getCounterAddress(provider.publicKey!));

			if (balance === 0) {
				throw 'counter not created';
			}

			const txSig = await program.methods
				.incrementCount()
				.accountsStrict({
					authority: provider.publicKey,
					counter: getCounterAddress(provider.publicKey!)
				})
				.rpc();
			toast.success('Transaction successful', {
				action: {
					label: 'See Explorer',
					onClick: () =>
						(window.location.href = `https://explorer.solana.com/tx/${txSig}?cluster=devnet`)
				}
			});
		} catch (e: any) {
			toast.error(`${e.message || e}`);
		}
	};
</script>

<div class="mt-16 flex flex-col items-center justify-center space-y-8">
	{$walletStore.publicKey?.toBase58() || 'not connected'}

	<div class="hidde flex flex-col items-center justify-center p-4 text-center">
		<div class="border p-4">
			<div class="min-w-32 p-2">
				<h1>Counter</h1>
				<h1 class="text-6xl">{loading ? '-' : count}</h1>
			</div>
			{#if provider}
				<div class="space-x-2 p-2">
					<Button on:click={incrementCount}>Increment 1x</Button>
				</div>
				<div class="space-x-2 p-2">
					<Button on:click={createCounter}>Create Counter</Button>
					<Button on:click={getBalance}>Get Balance: {balance} SOL</Button>
					<Button on:click={getCount}>Refresh Count</Button>
				</div>
			{/if}
		</div>
	</div>

	<div class="my-2 flex items-center justify-center">
		<WalletMultiButton />
	</div>
</div>

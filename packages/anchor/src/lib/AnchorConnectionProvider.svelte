<script lang="ts" generics="T extends Idl">
	import { get, writable, type Writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import { type WorkSpace, getWorkspace } from './workSpace.js';
	import { web3, Program, AnchorProvider, type Idl, type Wallet } from '@coral-xyz/anchor';
	import { walletStore, type WalletStore } from '@thewuh/wallet-adapter-svelte-core';

	export let idl: T,
		network: string,
		config: web3.Commitment | web3.ConnectionConfig | undefined = 'processed';

	const systemProgram = web3.SystemProgram;
	const connection = new web3.Connection(network, config);

	function initializeWorkspace() {
		const program = new Program(idl, new AnchorProvider(connection, {} as Wallet));

		const workSpace = writable<WorkSpace<T>>({
			connection,
			network,
			systemProgram,
			provider: undefined,
			program
		});

		setContext<Writable<WorkSpace<T>>>('workspace', workSpace);
	}

	function defineProgramAndProvider(walletStore: WalletStore) {
		let { signTransaction, signAllTransactions, publicKey } = walletStore;

		const isProvider = !!(signTransaction && signAllTransactions && publicKey);

		const providerWallet = (): Wallet => {
			if (!isProvider) {
				return {} as Wallet;
			} else {
				return { signAllTransactions, signTransaction, publicKey } as Wallet;
			}
		};

		const provider = new AnchorProvider(connection, providerWallet(), {
			preflightCommitment: 'processed'
		});

		const program = new Program(idl, provider);

		const workSpace = getWorkspace<T>();

		workSpace.set({
			connection,
			provider: isProvider ? provider : undefined,
			program,
			systemProgram,
			network
		});

		return {
			connection,
			provider,
			program,
			systemProgram,
			network
		};
	}

	initializeWorkspace();

	$: defineProgramAndProvider($walletStore);
</script>

<slot />

<script lang="ts" generics="T extends Idl">
	import { writable, type Writable } from 'svelte/store';
	import {setContext} from "svelte"
	import { type WorkSpace } from './workSpace.js';
	import { web3, Program, AnchorProvider, type Idl, type Wallet, } from '@coral-xyz/anchor';
	import { walletStore, type WalletStore } from '@thewuh/wallet-adapter-svelte-core';

	export let idl: T,
		network: string,
		config: web3.Commitment | web3.ConnectionConfig | undefined = 'processed';

	const systemProgram = web3.SystemProgram;
	const connection = new web3.Connection(network, config);

	function setWorkspace<T extends Idl>(workspace: Writable<WorkSpace<T>>) {
  		setContext("workspace", workspace)
	}

	function defineProgramAndProvider(walletStore: WalletStore) {
		let { signTransaction, signAllTransactions, publicKey } =
			walletStore;
		
		const providerWallet = {
			signTransaction,
			signAllTransactions,
			publicKey
		};
		
		const provider = new AnchorProvider(connection, providerWallet as Wallet, {
			preflightCommitment: 'processed'
		});

		const program = new Program(idl, provider);

		const workSpace = writable<WorkSpace<T>>(undefined);

		workSpace.set({
			connection,
			provider,
			program,
			systemProgram,
			network
		});

		setWorkspace(workSpace)

		return {
			connection,
			provider,
			program,
			systemProgram,
			network
		};
	}

	$: $walletStore && $walletStore.publicKey && defineProgramAndProvider($walletStore);
</script>

<slot />

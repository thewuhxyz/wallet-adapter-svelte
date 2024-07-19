<script lang="ts">
	import type { Commitment, ConnectionConfig } from '@solana/web3.js';
	import { workSpace } from './workSpace';
	import { web3, Program, AnchorProvider } from '@coral-xyz/anchor';
	import { walletStore } from '@thewuh/wallet-adapter-svelte-core';

	export let idl,
		network: string,
		config: Commitment | ConnectionConfig | undefined = 'processed';

	const { PublicKey } = web3;
	const programID = new PublicKey(idl.metadata.address);
	const baseAccount = web3.Keypair.generate();
	const systemProgram = web3.SystemProgram;
	const connection = new web3.Connection(network, config);

	function defineProgramAndProvider(walletStore) {
		let { sendTransaction, signTransaction, signAllTransactions, signMessage, publicKey } =
			walletStore;
		const providerWallet = {
			sendTransaction,
			signTransaction,
			signAllTransactions,
			signMessage,
			publicKey
		};
		const provider = new AnchorProvider(connection, providerWallet, {
			preflightCommitment: 'processed'
		});
		const program = new Program(idl, programID, provider);
		workSpace.set({
			baseAccount,
			connection,
			provider,
			program,
			systemProgram,
			network
		});
		return {
			baseAccount,
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

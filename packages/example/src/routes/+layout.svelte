<script lang="ts">
	import { AnchorConnectionProvider } from '@thewuh/wallet-adapter-svelte-anchor';
	import { WalletProvider } from '@thewuh/wallet-adapter-svelte-ui';
	import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
	import { type DemoProgram, DemoProgramIDLJson } from '$lib/idl';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';
	import { clusterApiUrl } from '@solana/web3.js';

	const localStorageKey = 'walletAdapter';
	const network = clusterApiUrl('devnet');

	const idl = DemoProgramIDLJson as DemoProgram;
</script>

<WalletProvider {localStorageKey} wallets={[]} />
<AnchorConnectionProvider {network} {idl}>
	<slot />
	<Toaster />
</AnchorConnectionProvider>

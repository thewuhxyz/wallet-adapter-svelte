<script lang="ts">
	import { AnchorConnectionProvider } from '@thewuh/wallet-adapter-svelte-anchor';
	import { WalletProvider } from '@thewuh/wallet-adapter-svelte-ui';
	import { type DemoProgram, DemoProgramIDLJson } from '$lib/idl';
	import { clusterApiUrl } from '@solana/web3.js';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';

	const localStorageKey = 'walletAdapter';
	const network = clusterApiUrl('devnet');

	const idl = DemoProgramIDLJson as DemoProgram;
</script>

<WalletProvider {localStorageKey} wallets={[]} />
<AnchorConnectionProvider {network} {idl}>
	<slot />
	<Toaster />
</AnchorConnectionProvider>

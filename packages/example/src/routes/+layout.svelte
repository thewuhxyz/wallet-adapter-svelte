<script lang="ts">
	import { AnchorConnectionProvider } from '@thewuh/wallet-adapter-svelte-anchor';
	import { WalletProvider } from '@thewuh/wallet-adapter-svelte-ui';
	import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
	import { type DemoProgram, DemoProgramIDLJson } from '$lib/idl';
	import { Toaster } from '$lib/components/ui/sonner';
	import '../app.css';

	const localStorageKey = 'walletAdapter';
	const network = 'http://127.0.0.1:8899';

	const wallets = undefined;
	// const wallets = [new PhantomWalletAdapter()];

	const idl = DemoProgramIDLJson as DemoProgram;
</script>

<WalletProvider {localStorageKey} wallets={wallets || []} />
<AnchorConnectionProvider {network} {idl}>
	<slot />
	<Toaster />
</AnchorConnectionProvider>

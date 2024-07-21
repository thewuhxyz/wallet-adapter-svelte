<script lang="ts">
	import type { Adapter } from '@solana/wallet-adapter-base';
	import { initialize } from '@thewuh/wallet-adapter-svelte-core';
	import type { WalletError } from '@solana/wallet-adapter-base';
	import { standardWalletAdapterStore } from '@thewuh/wallet-standard-wallet-adapter-svelte';

	standardWalletAdapterStore.mountListeners();

	export let localStorageKey: string,
		wallets: Adapter[],
		autoConnect = false,
		onError = (error: WalletError) => console.error(error);

	$: $standardWalletAdapterStore && console.log('standard store:', $standardWalletAdapterStore);

	$: wallet = standardWalletAdapterStore.fetchWallets(wallets);

	console.log('wallets:', wallet);

	$: $standardWalletAdapterStore &&
		initialize({
			wallets: standardWalletAdapterStore.fetchWallets(wallets),
			autoConnect,
			localStorageKey,
			onError
		});
</script>

<svelte:head>
	<script>
		window.global = window;
	</script>
</svelte:head>

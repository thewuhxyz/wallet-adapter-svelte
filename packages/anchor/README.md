# `@thewuh/wallet-adapter-svelte-anchor`

`AnchorConnectionProvider` component and `WorkSpace` for Solana wallets using Svelte

## Installing

You have already installed the core package to run the wallet Svelte Store [@thewuh/wallet-adapter-svelte-core](https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/core/README.md) and the UI components to use the wallet [@thewuh/wallet-adapter-svelte-ui](https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/ui/README.md). Then install the `AnchorConnectionProvider` component and `workSpace` file contained in this package.

```shell
npm i @thewuh/wallet-adapter-svelte-anchor
```

## Set Up

Use the same setup as [@thewuh/wallet-adapter-svelte-ui](https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/ui/README.md), using `AnchorConnectionProvider` in place of `ConnectionProvider`.

The `AnchorConnectionProvider` for Anchor Dapps accepts the next props.

| prop    | type     | default |
| ------- | -------- | ------- |
| network | `string` |         |
| idl     | `Idl`    |         |

It is automatically connected to a `getWorkspace` method that returns a store containing a `WorkSpace` context, which defined all the parameters to share among the components in your Anchor Dapp **(connection, provider, program, systemProgram and network)**.

## SvelteKit

In the **+layout.svelte** component you can import the wallets and setup the UI components.

```svelte
<script lang="ts">
	import { walletStore } from '@thewuh/wallet-adapter-svelte-core';
	import { WalletProvider, WalletMultiButton } from '@svelte-on-solana/wallet-adapter-svelte-ui';
	import {
		AnchorConnectionProvider,
		getWorkspace
	} from '@svelte-on-solana/wallet-adapter-svelte-anchor';
	import { clusterApiUrl } from '@solana/web3.js';
	import myAnchorProjectIdl from '../../../target/idl/<my-anchor-project>.json';
	import { type MyAnchorProject } from '../../../target/types/<my-anchor-project>.ts';

	const localStorageKey = 'walletAdapter';
	const network = clusterApiUrl('devnet');

	const idl = myAnchorProjectIdl as MyAnchorProject;
</script>

<WalletProvider {localStorageKey} wallets={[]} />
<AnchorConnectionProvider {network} {idl}>
	<WalletMultiButton />
	<slot />
</AnchorConnectionProvider>
```

### Usage

Use the `Workspace` context like:
```svelte
<script lang="ts">
	import { getWorkspace } from '@thewuh/wallet-adapter-svelte-anchor';
	import { type MyAnchorProject } from '../../../target/types/<my-anchor-project>.ts';

	$: w = getWorkspace<MyAnchorProject>();
  $: ({ connection, program, provider, systemProgram } = $w);
  //...
</script>
```

## Svelte Template

In `App.svelte` or the entry point of your SPA, you can setup the wallet and components like this.

```svelte
<script lang="ts">
	import { walletStore } from '@thewuh/wallet-adapter-svelte-core';
	import { WalletProvider, WalletMultiButton } from '@svelte-on-solana/wallet-adapter-svelte-ui';
	import {
		AnchorConnectionProvider,
		getWorkspace
	} from '@svelte-on-solana/wallet-adapter-svelte-anchor';
	import { clusterApiUrl } from '@solana/web3.js';
	import myAnchorProject from '../../../target/idl/<my-anchor-project>.json';
	import { MyAnchorProject } from '../../../target/types/<my-anchor-project>.ts';
	import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

	const localStorageKey = 'walletAdapter';
	const network = clusterApiUrl('devnet'); // localhost or mainnet

	// May not be necessary. Most wallet support wallet standard
	let wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
</script>

<WalletProvider {localStorageKey} {wallets} autoConnect />
<AnchorConnectionProvider {network} {idl}>
	<WalletMultiButton />
	{#if $walletStore?.connected}
		<div>My wallet is connected</div>
	{/if}
</AnchorConnectionProvider>
```

## Example Implementation

See example implementations of the `@thewuh/wallet-adapter-svelte-ui` library.

-   [Source code](https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/example)
-   [Demo site][1]

[1]: https://github.com/silvestrevivo/solana-svelte-counter/tree/master/app

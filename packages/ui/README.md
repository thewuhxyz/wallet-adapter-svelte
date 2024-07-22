# `@thewuh/wallet-adapter-svelte-ui`

Pre-built components for integrating with Solana wallets using Svelte

## Getting Started

The UI components need to be installed into a project that is already set up with `@solana/web3.js` and the base wallet adapters. Therefore, it cannot work standalone.

During this process, you will:

-   📦 Install the base wallet adapters
-   📦 Install the svelte adapter and svelte UI
-   🔨 Add the `ConnectionProvider` ([`AnchorConnectionProvider`](https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/anchor/README.md) if you're using Anchor)
-   🔨 Add the `WalletProvider` component
-   🔨 Add the `WalletMultiButton` component

## Installing

You have already installed the core package to run the wallet Svelte Store [@thewuh/wallet-adapter-core](github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/core/README.md). Then install the UI components contained in this package

```shell
npm i @thewuh/wallet-adapter-svelte-ui
```

## Set Up

There are three components that you need to get set up:

-   `WalletProvider`
-   `ConnectionProvider` (`[AnchorConnectionProvider](https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/anchor/README.md)` if you're using Anchor)
-   `WalletMultiButton`

`WalletProvider` is a component used to initialize the wallet stores and add event listeners

| prop             | type        | default           |
| ---------------- | ----------- | ----------------- |
| localStorageKey? | `string`    | `'walletAdapter'` |
| wallets          | `Wallets[]` |                   |
| autoConnect?     | `boolean`   | `false`           |

`ConnectionProvider` is a component used to establish a connection with the network.

| prop    | type     | default |
| ------- | -------- | ------- |
| network | `string` |         |

Alternatively you can use `AnchorConnectionProvider` for Anchor Dapps.

| prop    | type     | default |
| ------- | -------- | ------- |
| network | `string` |         |
| idl     | `Idl`    |         |

`WalletMultiButton` is a component used as the entry point to connect/disconnect a wallet.

| prop               | type     | default |
| ------------------ | -------- | ------- |
| maxNumberOfWallets | `number` | `3`     |

## Usage

> Install a few plugins to take care about JSON imports and built-on Node.js modules not available in the browser.

```shell
npm install -D vite-plugin-node-polyfills
```

Then you have to adjust the **vite.config.ts** file to prepare the project for all the Solana packages previously installed.

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [nodePolyfills(), sveltekit()]
});
```

And then in the **+layout.svelte** component you can import the wallets and setup the UI components.

```svelte
<script lang="ts">
	import { clusterApiUrl } from '@solana/web3.js';
	import {
		workSpace,
		WalletProvider,
		WalletMultiButton,
		ConnectionProvider
	} from '@thewuh/wallet-adapter-svelte-ui';

	const localStorageKey = 'walletAdapter';
	const network = clusterApiUrl('devnet'); // localhost or mainnet

  // May not be necessary. Most wallet support wallet standard
  let wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
</script>

<WalletProvider {localStorageKey} {wallets} autoConnect />
<ConnectionProvider {network} />
<div>
	<slot />
</div>
<WalletMultiButton />
```


## Working with Anchor

If you work with Anchor you will need the `AnchorConnectionProvider` component and its workSpace [@thewuh/wallet-adapter-svelte-anchor](https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/anchor/README.md)

## Example Implementation
See example implementations of the `@thewuh/wallet-adapter-svelte-ui` library.

-   [Source code](https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/example)
-   [Demo site][1]

[1]: https://github.com/silvestrevivo/solana-svelte-counter/tree/master/app
# `@thewuh/wallet-adapter-svelte-core`

The core of the wallet adapter is a Svelte Store which exposes methods and properties to run the wallet in your application. This allows to share this data among all components in your application.

## Install

```shell
npm install @thewuh/wallet-adapter-svelte-core \
            @solana/web3.js \
            @solana/wallet-adapter-wallets
```

## Use

Once it is installed, you can use it and subscribe to its methods as an usual Svelte Store:

```svelte
<script>
    import { walletStore } from '@thewuh/wallet-adapter-svelte-core';
    //...
</script>

{#if $walletStore?.connected}
<div>My wallet is connected</div>
{/if}
```

## UI

To complete the setup you will need to add some UI components which will provide the full experience to connect, disconnect and visualize address. You can choose between the [Svelte Template](https://github.com/sveltejs/template) or the [SvelteKit](https://kit.svelte.dev/) implementation.

-   [Using UI Package](https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/ui/README.md)

# `@thewuh/wallet-standard-wallet-adapter-svelte`

This helper creates a store for managing adapter that follow the Wallet Standard in your svelte application. It is used by `core` to handle adapters.

## Install

```shell
npm install @thewuh/wallet-standard-wallet-adapter-svelte \
            @solana/wallet-adapter-base\
            @solana/wallet-standard-wallet-adapter-base
```

## Use

Once it is installed, you can use it and subscribe to its methods as an usual Svelte Store:

```ts
import { createStandardWalletAdapterStore } from '@thewuh/wallet-standard-wallet-adapter-svelte';

export const standardWalletAdapterStore = createStandardWalletAdapterStore();
//...
```

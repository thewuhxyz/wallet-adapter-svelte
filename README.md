# `@thewuh/wallet-adapter-svelte`

![Wallets](wallets-adapter.png)

Modular TypeScript wallet adapter and UI components for Solana/Anchor applications using [SvelteJS](https://svelte.dev/) as framework. This package contains a solution for [Svelte Template](https://github.com/sveltejs/template) and [SvelteKit](https://kit.svelte.dev/), making possible to build Solana Dapps in SPA or SSR mode.

[View demo][6] / [Browse demo code][5]

## Packages

- [Standard][1] - Svelte Store that helps to manage adapters that follow the Wallet Standard
- [Core][2] - Svelte Store which exposes methods and properties to run the wallet in your application
- [UI][3] - Pre-built components for integrating with Solana wallets using Svelte
- [Anchor][4] - Helper components for working with Anchor

## Build from Source

1. Clone the project:
```shell
git clone https://github.com/thewuh/wallet-adapter-svelte.git
```

2. Install dependencies:
```shell
cd wallet-adapter
pnpm install
```

3. Build all packages:
```shell
pnpm build
```

4. Run locally:
```shell
cd packages/ui/
yarn start
```

[1]: https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/standard/README.md/
[2]: https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/core/README.md/
[3]: https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/ui/README.md
[4]: https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/anchor/README.md
[5]: https://github.com/thewuhxyz/wallet-adapter-svelte/blob/main/packages/example
[6]: https://solana-svelte-counter.netlify.app/

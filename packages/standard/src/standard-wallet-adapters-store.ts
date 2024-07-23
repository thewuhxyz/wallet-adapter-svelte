import { isWalletAdapterCompatibleStandardWallet, type Adapter, type WalletName } from '@solana/wallet-adapter-base';
import { StandardWalletAdapter } from '@solana/wallet-standard-wallet-adapter-base';
import { getWallets as getStandardWallets } from '@wallet-standard/app';
import type { Wallet } from '@wallet-standard/base';
import { onDestroy, onMount } from 'svelte';
import { get, writable } from 'svelte/store';

export function createStandardWalletAdapterStore() {
    const { subscribe, update } = writable<Readonly<StandardWalletAdapter[]>>([]);

    const { get: getWallets, on } = getStandardWallets();

    const standardAdapter = () => get({ subscribe });

    function initialize() {
        onMount(() => {
            const { invalidate } = setupListeners();

            initializeAdapters();

            return invalidate;
        });

        onDestroy(destroyAdapters);
    }

    function setupListeners(): { invalidate: () => void } {
        const listeners = [
            on('register', (...wallets) => runUpdate(wrapWalletsWithAdapters(wallets))),
            on('unregister', (...wallets) =>
                runUpdate(
                    standardAdapter().filter((standardAdapter) =>
                        wallets.some((wallet) => wallet === standardAdapter.wallet)
                    )
                )
            ),
        ];

        return { invalidate: () => listeners.forEach((off) => off()) };
    }

    function initializeAdapters() {
        runUpdate(wrapWalletsWithAdapters(getWallets()));
    }

    function destroyAdapters() {
        standardAdapter().forEach((adapter) => adapter.destroy());
    }

    function runUpdate(wallets: Readonly<StandardWalletAdapter[]>) {
        update((current) => updateAdapter(current, wallets));
    }

    function getAdapters(adapters: Adapter[]): Adapter[] {
        const warnings = new Set<WalletName>();
        return [
            ...standardAdapter(),
            ...adapters.filter(({ name }) => {
                if (standardAdapter().some((standardAdapter) => standardAdapter.name === name)) {
                    if (!warnings.has(name)) {
                        warnings.add(name);
                        console.warn(
                            `${name} was registered as a Standard Wallet. The Wallet Adapter for ${name} can be removed from your app.`
                        );
                    }
                    return false;
                }
                return true;
            }),
        ];
    }

    return { subscribe, initialize, getAdapters };
}

function updateAdapter(
    current: Readonly<StandardWalletAdapter[]>,
    newAdapters: Readonly<StandardWalletAdapter[]>
): StandardWalletAdapter[] {
    const previous = current;

    const updated = new Set([...current, ...newAdapters]);

    const removed = new Set(previous.filter((previousAdapter) => !updated.has(previousAdapter)));

    removed.forEach((adapter) => adapter.destroy());

    return Array.from(updated);
}

function wrapWalletsWithAdapters(wallets: readonly Wallet[]): readonly StandardWalletAdapter[] {
    return wallets
        .filter(isWalletAdapterCompatibleStandardWallet)
        .map((wallet) => new StandardWalletAdapter({ wallet }));
}

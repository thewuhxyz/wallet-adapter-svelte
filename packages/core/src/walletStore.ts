import type {
    Adapter,
    MessageSignerWalletAdapter,
    MessageSignerWalletAdapterProps,
    SendTransactionOptions,
    SignerWalletAdapter,
    SignerWalletAdapterProps,
    SignInMessageSignerWalletAdapter,
    SignInMessageSignerWalletAdapterProps,
    StandardWalletAdapter as Sta,
    WalletError,
    WalletName,
} from '@solana/wallet-adapter-base';
import { WalletNotConnectedError, WalletNotReadyError, WalletReadyState } from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import { get, writable } from 'svelte/store';
import { WalletNotSelectedError } from './errors.js';
import { getLocalStorage, setLocalStorage } from './localStorage.js';
// import { standardWalletAdapterStore } from "./wallet-standard.js";
import { getStandardWalletAdapterStore } from '@thewuh/wallet-standard-wallet-adapter-svelte';
import { StandardWalletAdapter } from '@solana/wallet-standard-wallet-adapter-base';

interface Wallet {
    adapter: Adapter;
    readyState: WalletReadyState;
}

type ErrorHandler = (error: WalletError) => void;
type WalletPropsConfig = Pick<WalletStore, 'autoConnect' | 'localStorageKey' | 'onError'> & { wallets: Adapter[] };
type WalletReturnConfig = Pick<WalletStore, 'wallets' | 'autoConnect' | 'localStorageKey' | 'onError'>;

type WalletStatus = Pick<WalletStore, 'connected' | 'publicKey'>;

export interface WalletStore {
    // props
    autoConnect: boolean;
    wallets: Wallet[];

    // wallet state
    adapter: Adapter | null;
    connected: boolean;
    connecting: boolean;
    disconnecting: boolean;
    localStorageKey: string;
    onError: ErrorHandler;
    publicKey: PublicKey | null;
    ready: WalletReadyState;
    wallet: Adapter | null;
    walletsByName: Record<WalletName, Adapter>;
    name: WalletName | null;

    // wallet methods
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    select(walletName: WalletName): void;
    sendTransaction(
        transaction: Transaction | VersionedTransaction,
        connection: Connection,
        options?: SendTransactionOptions
    ): Promise<TransactionSignature>;
    signAllTransactions: SignerWalletAdapter['signAllTransactions'] | undefined;
    signMessage: MessageSignerWalletAdapter['signMessage'] | undefined;
    signTransaction: SignerWalletAdapter['signTransaction'] | undefined;
    signIn: SignInMessageSignerWalletAdapter['signIn'] | undefined;
}

export const walletStore = createWalletStore();
export const standardWalletStore = getStandardWalletAdapterStore();

function addAdapterEventListeners(adapter: Adapter) {
    const { onError, wallets } = get(walletStore);

    wallets.forEach(({ adapter }) => {
        adapter.on('readyStateChange', onReadyStateChange, adapter);
    });
    adapter.on('connect', onConnect);
    adapter.on('disconnect', onDisconnect);
    adapter.on('error', onError);
}

async function autoConnect() {
    const { adapter } = get(walletStore);

    try {
        walletStore.setConnecting(true);
        await adapter?.connect();
    } catch (error: unknown) {
        // Clear the selected wallet
        walletStore.resetWallet();
        // Don't throw error, but onError will still be called
    } finally {
        walletStore.setConnecting(false);
    }
}

async function connect(): Promise<void> {
    const { connected, connecting, disconnecting, ready, adapter } = get(walletStore);
    if (connected || connecting || disconnecting) return;

    if (!adapter) throw newError(new WalletNotSelectedError());

    if (!(ready === WalletReadyState.Installed || ready === WalletReadyState.Loadable)) {
        walletStore.resetWallet();

        if (typeof window !== 'undefined') {
            window.open(adapter.url, '_blank');
        }

        throw newError(new WalletNotReadyError());
    }

    try {
        walletStore.setConnecting(true);
        await adapter.connect();
    } catch (error: unknown) {
        walletStore.resetWallet();
        throw error;
    } finally {
        walletStore.setConnecting(false);
    }
}

function createWalletStore() {
    const { subscribe, update } = writable<WalletStore>({
        autoConnect: false,
        wallets: [],
        adapter: null,
        connected: false,
        connecting: false,
        disconnecting: false,
        localStorageKey: 'walletAdapter',
        onError: (error: WalletError) => console.error(error),
        publicKey: null,
        ready: 'Unsupported' as WalletReadyState,
        wallet: null,
        name: null,
        walletsByName: {},
        connect,
        disconnect,
        select,
        sendTransaction,
        signTransaction: undefined,
        signAllTransactions: undefined,
        signMessage: undefined,
        signIn: undefined,
    });

    function updateWalletState(adapter: Adapter | null) {
        updateAdapter(adapter);
        update((store: WalletStore) => ({
            ...store,
            name: adapter?.name || null,
            wallet: adapter,
            ready: adapter?.readyState || ('Unsupported' as WalletReadyState),
            publicKey: adapter?.publicKey || null,
            connected: adapter?.connected || false,
        }));

        if (!adapter) return;

        if (shouldAutoConnect()) {
            autoConnect();
        }
    }

    function updateWalletName(name: WalletName | null) {
        const { localStorageKey, walletsByName } = get(walletStore);

        const adapter = walletsByName?.[name as WalletName] ?? null;

        //@ts-ignore
        console.log('here to test adapter update name signTransaction here... :', adapter?.signTransaction);

        setLocalStorage(localStorageKey, name);
        updateWalletState(adapter);
    }

    function updateAdapter(adapter: Adapter | null) {
        removeAdapterEventListeners();

        let signTransaction: SignerWalletAdapter['signTransaction'] | undefined = undefined;
        let signAllTransactions: SignerWalletAdapter['signAllTransactions'] | undefined = undefined;
        let signMessage: MessageSignerWalletAdapter['signMessage'] | undefined = undefined;
        let signIn: SignInMessageSignerWalletAdapter['signIn'] | undefined = undefined;

        if (adapter) {
            // check for supported features if they exist for adapter. `in` exhibiting unexpected behaviour
            // with `StandardWalletAdapter`. May be looking for feature in `BaseWalletAdapter` which
            // `StandardWalletAdapter` extends. Add fallback in case.

            // Sign a transaction if the wallet supports it
            if ('signTransaction' in adapter || adapter instanceof StandardWalletAdapter) {
                console.log('sign transaction triggered by adapter:', adapter.name, 'signTransaction' in adapter);
                signTransaction = async function <T extends Transaction | VersionedTransaction>(transaction: T) {
                    const { connected } = get(walletStore);
                    if (!connected) throw newError(new WalletNotConnectedError());
                    return await adapter.signTransaction!(transaction);
                };
            }

            // Sign multiple transactions if the wallet supports it
            if ('signAllTransactions' in adapter || adapter instanceof StandardWalletAdapter) {
                console.log(
                    'sign all transactions triggered by adapter:',
                    adapter.name,
                    'signAllTransactions' in adapter
                );
                signAllTransactions = async function <T extends Transaction | VersionedTransaction>(transactions: T[]) {
                    const { connected } = get(walletStore);
                    if (!connected) throw newError(new WalletNotConnectedError());
                    return await adapter.signAllTransactions!(transactions);
                };
            }

            // Sign an arbitrary message if the wallet supports it
            if ('signMessage' in adapter || adapter instanceof StandardWalletAdapter) {
                console.log('sign message triggered by adapter:', adapter.name, 'signMessage' in adapter);
                signMessage = async function (message: Uint8Array) {
                    const { connected } = get(walletStore);
                    if (!connected) throw newError(new WalletNotConnectedError());
                    return await adapter.signMessage!(message);
                };
            }

            // signIn doesn't seem to be affected by this for some reason
            // sign in if the wallet supports it
            if ('signIn' in adapter) {
                console.log('signIn in adapter');
                signIn = async function (input?) {
                    const { connected } = get(walletStore);
                    if (!connected) throw newError(new WalletNotConnectedError());
                    return await adapter.signIn!(input);
                };
            }

            addAdapterEventListeners(adapter);
        }

        update((store: WalletStore) => ({
            ...store,
            adapter,
            signTransaction,
            signAllTransactions,
            signMessage,
            signIn,
        }));
    }

    return {
        resetWallet: () => updateWalletName(null),
        setConnecting: (connecting: boolean) => update((store: WalletStore) => ({ ...store, connecting })),
        setDisconnecting: (disconnecting: boolean) => update((store: WalletStore) => ({ ...store, disconnecting })),
        setReady: (ready: WalletReadyState) => update((store: WalletStore) => ({ ...store, ready })),
        subscribe,
        updateConfig: (walletConfig: WalletReturnConfig & { walletsByName: Record<WalletName, Adapter> }) =>
            update((store: WalletStore) => ({
                ...store,
                ...walletConfig,
            })),
        updateWallets: (wallets: Wallet[]) => update((store: WalletStore) => ({ ...store, ...wallets })),
        updateStatus: (walletStatus: WalletStatus) => update((store: WalletStore) => ({ ...store, ...walletStatus })),
        updateWallet: (walletName: WalletName) => updateWalletName(walletName),
    };
}

async function disconnect(): Promise<void> {
    const { disconnecting, adapter } = get(walletStore);
    if (disconnecting) return;

    if (!adapter) return walletStore.resetWallet();

    try {
        walletStore.setDisconnecting(true);
        await adapter.disconnect();
    } finally {
        walletStore.resetWallet();
        walletStore.setDisconnecting(false);
    }
}

export async function initialize({
    wallets,
    autoConnect = false,
    localStorageKey = 'walletAdapter',
    onError = (error: WalletError) => console.error(error),
}: WalletPropsConfig): Promise<void> {
    const walletsByName = wallets.reduce<Record<WalletName, Adapter>>((walletsByName, wallet) => {
        walletsByName[wallet.name] = wallet;
        return walletsByName;
    }, {});

    console.log('wallets by name:', walletsByName);

    // Wrap adapters to conform to the `Wallet` interface
    wallets.forEach((adapter) => console.log('ready state:', adapter.readyState));

    const mapWallets = wallets.map((adapter) => ({
        adapter,
        readyState: adapter.readyState,
    }));

    walletStore.updateConfig({
        wallets: mapWallets,
        walletsByName,
        autoConnect,
        localStorageKey,
        onError,
    });

    const walletName = getLocalStorage<WalletName>(localStorageKey);

    if (walletName) {
        walletStore.updateWallet(walletName);
    }
}

function newError(error: WalletError): WalletError {
    const { onError } = get(walletStore);
    onError(error);
    return error;
}

function onConnect() {
    const { adapter } = get(walletStore);
    if (!adapter) return;

    walletStore.updateStatus({
        publicKey: adapter.publicKey,
        connected: adapter.connected,
    });
}

function onDisconnect() {
    walletStore.resetWallet();
}

function onReadyStateChange(this: Adapter, readyState: WalletReadyState) {
    const { adapter, wallets } = get(walletStore);
    if (!adapter) return;

    walletStore.setReady(adapter.readyState);

    // When the wallets change, start to listen for changes to their `readyState`
    const walletIndex = wallets.findIndex(({ adapter }) => adapter.name === this.name);
    if (walletIndex === -1) {
        return;
    } else {
        walletStore.updateWallets([
            ...wallets.slice(0, walletIndex),
            { ...wallets[walletIndex], readyState },
            ...wallets.slice(walletIndex + 1),
        ]);
    }
}

function removeAdapterEventListeners(): void {
    const { adapter, onError, wallets } = get(walletStore);
    if (!adapter) return;

    wallets.forEach(({ adapter }) => {
        adapter.off('readyStateChange', onReadyStateChange, adapter);
    });
    adapter.off('connect', onConnect);
    adapter.off('disconnect', onDisconnect);
    adapter.off('error', onError);
}

async function select(walletName: WalletName): Promise<void> {
    const { name, adapter } = get(walletStore);
    if (name === walletName) return;

    if (adapter) await disconnect();

    walletStore.updateWallet(walletName);
}

async function sendTransaction(
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendTransactionOptions
): Promise<TransactionSignature> {
    const { connected, adapter } = get(walletStore);
    if (!connected) throw newError(new WalletNotConnectedError());
    if (!adapter) throw newError(new WalletNotSelectedError());

    return await adapter.sendTransaction(transaction, connection, options);
}

function shouldAutoConnect(): boolean {
    const { adapter, autoConnect, ready, connected, connecting } = get(walletStore);

    return !(
        !autoConnect ||
        !adapter ||
        !(ready === WalletReadyState.Installed || ready === WalletReadyState.Loadable) ||
        connected ||
        connecting
    );
}

if (typeof window !== 'undefined') {
    // Ensure the adapter listeners are invalidated before refreshing the page.
    window.addEventListener('beforeunload', removeAdapterEventListeners);
}

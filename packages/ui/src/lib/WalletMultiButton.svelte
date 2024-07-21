<script lang="ts">
	import { walletStore, type WalletStore } from '@thewuh/wallet-adapter-svelte-core';
	import WalletButton from './WalletButton.svelte';
	import WalletConnectButton from './WalletConnectButton.svelte';
	import WalletModal from './WalletModal.svelte';
	import './styles.css';
	import { click, clickOutside } from './onclick.js';

	export let maxNumberOfWallets = 3;

	$: ({ publicKey, wallet, disconnect, connect, select } = $walletStore);

	let dropDrownVisible = false,
		modalVisible = false,
		copied = false;

	$: base58 = publicKey && publicKey?.toBase58();
	$: content = showAddressContent($walletStore);

	const copyAddress = async () => {
		if (!base58) return;
		await navigator.clipboard.writeText(base58);
		copied = true;
		setTimeout(() => (copied = false), 400);
	};

	const openDropdown = () => (dropDrownVisible = true);
	const closeDropdown = () => (dropDrownVisible = false);
	const openModal = () => {
		modalVisible = true;
		closeDropdown();
	};
	const closeModal = () => (modalVisible = false);

	function showAddressContent(store: WalletStore) {
		const base58 = store.publicKey?.toBase58();
		if (!store.wallet || !base58) return null;
		return base58.slice(0, 4) + '..' + base58.slice(-4);
	}

	async function connectWallet(event: any) {
		closeModal();
		await select(event.detail);
		await connect();
	}

	async function disconnectWallet(event: any) {
		closeDropdown();
		await disconnect();
	}
</script>

{#if !wallet}
	<WalletButton class="wallet-adapter-button-trigger" on:click={openModal}>
		<slot>Select Wallet</slot>
	</WalletButton>
{:else if !base58}
	<WalletConnectButton />
{:else}
	<div class="wallet-adapter-dropdown">
		<WalletButton on:click={openDropdown} class="wallet-adapter-button-trigger">
			<svelte:fragment slot="start-icon">
				<img src={wallet.icon} alt={`${wallet.name} icon`} />
			</svelte:fragment>
			{content}
		</WalletButton>
		{#if dropDrownVisible}
			<ul
				aria-label="dropdown-list"
				class="wallet-adapter-dropdown-list wallet-adapter-dropdown-list-active"
				role="menu"
				use:clickOutside={() => {
					if (dropDrownVisible) {
						closeDropdown();
					}
				}}
			>
				<li
					class="wallet-adapter-dropdown-list-item"
					role="menuitem"
					use:click={copyAddress}
				>
					{copied ? 'Copied' : 'Copy address'}
				</li>
				<li use:click={openModal} class="wallet-adapter-dropdown-list-item" role="menuitem">
					Connect a different wallet
				</li>
				<li
					use:click={disconnectWallet}
					class="wallet-adapter-dropdown-list-item"
					role="menuitem"
				>
					Disconnect
				</li>
			</ul>
		{/if}
	</div>
{/if}

{#if modalVisible}
	<WalletModal on:close={closeModal} on:connect={connectWallet} {maxNumberOfWallets} />
{/if}

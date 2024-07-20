import { type DemoProgram } from "./idl"
import { Program } from "@coral-xyz/anchor"
import {
	Connection,
	PublicKey,
	SystemProgram,
	Transaction,
	TransactionMessage,
	VersionedTransaction,
} from "@solana/web3.js"
import type { WalletStore } from "@thewuh/wallet-adapter-svelte-core"


class DemoProgramIxBuilder {
	constructor(public program: Program<DemoProgram>) {}

	createCounterIx = async ({
		counter,
		authority,
	}: {
		counter: PublicKey
		authority: PublicKey
	}) => {
		return await this.program.methods
			.createCounter()
			.accountsStrict({
				authority,
				counter,
				systemProgram: SystemProgram.programId,
			})
			.instruction()
	}

	incrementCountIx = async ({
		counter,
		authority,
	}: {
		counter: PublicKey
		authority: PublicKey
	}) => {
		return await this.program.methods
			.incrementCount()
			.accountsStrict({
				authority,
				counter,
			})
			.instruction()
	}
}

export class DemoProgramClient extends DemoProgramIxBuilder {
	constructor(public program: Program<DemoProgram>, public connection: Connection) {
		super(program)
	}

	get programId() {
		return this.program.programId
	}


	async count(wallet: WalletStore) {
		if (!wallet.publicKey) throw new Error("wallet not connected")
		const { count } = await this.program.account.counter.fetch(
			this.getAddress(wallet.publicKey)
		)
		return count.toString(10)
	}

	async createCounter(wallet: WalletStore) {
		if (!wallet.publicKey || !wallet.signTransaction)
			throw new Error("wallet not connected")

		const createCounterIx = await this.createCounterIx({
			authority: wallet.publicKey,
			counter: this.getAddress(wallet.publicKey),
		})

		const latestBlockhash = await this.connection.getLatestBlockhash()

		const messageV0 = new TransactionMessage({
			payerKey: wallet.publicKey,
			recentBlockhash: latestBlockhash.blockhash,
			instructions: [createCounterIx],
		}).compileToV0Message()

		const transaction = new VersionedTransaction(messageV0)

		const tx = await wallet.signTransaction(transaction)

		const txSig = await this.connection.sendTransaction(tx)

		const confirmation = await this.connection.confirmTransaction({
			signature: txSig,
			blockhash: latestBlockhash.blockhash,
			lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
		})

		return txSig
	}

	async incrementCount(wallet: WalletStore) {
		// try {
		if (!wallet.publicKey || !wallet.signTransaction)
			throw new Error("wallet not connected")
		const incrementIx = await this.incrementCountIx({
			authority: wallet.publicKey,
			counter: this.getAddress(wallet.publicKey),
		})

		const transaction = new Transaction()
		transaction.feePayer = wallet.publicKey
		transaction.recentBlockhash = (
			await this.connection.getLatestBlockhash()
		).blockhash
		transaction.add(incrementIx)

		const tx = await wallet.signTransaction(transaction)

		const txSig = await this.connection.sendRawTransaction(tx.serialize())
		return txSig
	}

	getAddress(authority: PublicKey) {
		return PublicKey.findProgramAddressSync(
			[Buffer.from("counter"), authority.toBuffer()],
			this.programId
		)[0]
	}
}

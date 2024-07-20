import { type Writable } from 'svelte/store';
import { getContext } from "svelte";

import type { Program, Provider, web3, Idl } from '@coral-xyz/anchor';

export type WorkSpace<T extends Idl> = {
  connection: web3.Connection;
  provider?: Provider;
  program: Program<T>;
  systemProgram: typeof web3.SystemProgram;
  network: string;
};

export function getWorkspace<T extends Idl>(): Writable<WorkSpace<T>> {
  return getContext<Writable<WorkSpace<T>>>("workspace")
}

import { Window as KeplrWindow, KeplrSignOptions } from "@keplr-wallet/types";
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { OfflineAminoSigner } from '@cosmjs/amino';
import { CHAIN_ID, KEPLR_CHAIN_INFO } from "./config";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {}
}

export type Callback = ((e: Event) => void);

const callbacks = new Set<Callback>();

function onKeystoreChange(e: Event) {
  for (const fn of callbacks) {
    fn(e);
  }
}

window.addEventListener('keplr_keystorechange', onKeystoreChange);

export function registerKeplrKeystoreChangeCallback(fn: Callback) {
  callbacks.add(fn);
  return () => callbacks.delete(fn);
}

export async function loadKeplr(chainId: string, signOptions?: KeplrSignOptions) {
  if (!window.keplr) {
    throw new Error('Keplr not found');
  }
  await window.keplr.experimentalSuggestChain(KEPLR_CHAIN_INFO);
  await window.keplr.enable(chainId);
  const keplrOfflineSigner = window.getOfflineSigner!(chainId);
  const offlineSigner: OfflineDirectSigner & OfflineAminoSigner = {
    async getAccounts() {
      return keplrOfflineSigner.getAccounts();
    },
    async signAmino(signerAddress, signDoc) {
      return window.keplr!.signAmino(chainId, signerAddress, signDoc, signOptions);
    },
    async signDirect(signerAddress, signDoc) {
      return window.keplr!.signDirect(chainId, signerAddress, signDoc, signOptions);
    },
  };
  return offlineSigner;
}

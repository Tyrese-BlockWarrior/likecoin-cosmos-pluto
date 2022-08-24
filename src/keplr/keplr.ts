import {
  Keplr,
  Window as KeplrWindow,
  KeplrSignOptions,
} from "@keplr-wallet/types";
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { OfflineAminoSigner } from '@cosmjs/amino';
import { KEPLR_CHAIN_INFO } from "@/config";
import { getWCKeplr } from './get-wc-keplr';

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

// TODO: what about wallet connect?
window.addEventListener('keplr_keystorechange', onKeystoreChange);

export function registerKeplrKeystoreChangeCallback(fn: Callback) {
  callbacks.add(fn);
  return () => callbacks.delete(fn);
}

export async function getBrowserKeplrOfflineSigner(chainId: string, signOptions?: KeplrSignOptions) {
  if (!window.keplr) {
    throw new Error('Keplr not found');
  }
  await window.keplr.experimentalSuggestChain(KEPLR_CHAIN_INFO);
  return getKeplrOfflineSigner(window.keplr, chainId, signOptions);
}

export async function getMobileKeplrOfflineSigner(chainId: string, signOptions?: KeplrSignOptions) {
  const keplr = await getWCKeplr();
  return getKeplrOfflineSigner(keplr, chainId, signOptions);
}

export async function getKeplrOfflineSigner(keplr: Keplr, chainId: string, signOptions?: KeplrSignOptions) {
  await keplr.enable(chainId);
  const keplrOfflineSigner = keplr.getOfflineSigner(chainId);
  const offlineSigner: OfflineDirectSigner & OfflineAminoSigner = {
    async getAccounts() {
      return keplrOfflineSigner.getAccounts();
    },
    async signAmino(signerAddress, signDoc) {
      return keplr.signAmino(chainId, signerAddress, signDoc, signOptions);
    },
    async signDirect(signerAddress, signDoc) {
      return keplr.signDirect(chainId, signerAddress, signDoc, signOptions);
    },
  };
  return offlineSigner;
}

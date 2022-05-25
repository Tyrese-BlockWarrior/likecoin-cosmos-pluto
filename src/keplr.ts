import { Window as KeplrWindow, KeplrSignOptions } from "@keplr-wallet/types";
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { OfflineAminoSigner } from '@cosmjs/amino';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {}
}

export async function loadKeplr(chainId: string, signOptions?: KeplrSignOptions) {
  if (!window.keplr) {
    throw new Error('Keplr not found');
  }
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

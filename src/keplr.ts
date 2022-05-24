import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {}
}

export async function initKeplr(chainId: string) {
  if (!window.keplr) {
    throw new Error('Keplr not found');
  }
  await window.keplr.enable(chainId);
  const offlineSigner = window.getOfflineSigner!(chainId); // TODO: wrap keplr instead of use OfflineSigner for more options
  return offlineSigner;
}

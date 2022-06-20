import { StargateClient, SigningStargateClient } from "@cosmjs/stargate";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { RPC_ENDPOINT } from "@/config";

import { encodeTx } from './tx';
import { encodeHex } from "@/utils/utils";

let stargateClient = null as StargateClient | null;

export async function initStargateClient() {
  if (!stargateClient) {
    stargateClient = await StargateClient.connect(RPC_ENDPOINT);
  }
  return stargateClient;
}

export async function getSigningStargateClient(offlineSigner: OfflineSigner) {
  return await SigningStargateClient.connectWithSigner(RPC_ENDPOINT, offlineSigner)
}

export async function readAccountChainInfo(address: string) {
  const stargateClient = await initStargateClient();
  const acc = await stargateClient.getAccount(address);
  if (acc === null) {
    throw new Error(`Account not found for ${address}`);
  }
  return acc;
}

export async function broadcastTx(txRaw: TxRaw) {
  const { txBytes, txHash } = encodeTx(txRaw);
  const stargateClient = await initStargateClient();
  const deliverTxPromise = stargateClient.broadcastTx(txBytes);
  return {
    txHash,
    txID: encodeHex(txHash),
    getResponse: async () => await deliverTxPromise,
  };
}

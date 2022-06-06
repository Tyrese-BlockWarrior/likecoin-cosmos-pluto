import { StargateClient } from "@cosmjs/stargate";
import { sha256 } from "@cosmjs/crypto";

import { RPC_ENDPOINT } from "@/config";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

let stargateClient = null as StargateClient | null;

export async function initStargateClient() {
  if (!stargateClient) {
    stargateClient = await StargateClient.connect(RPC_ENDPOINT);
  }
  return stargateClient;
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
  const stargateClient = await initStargateClient();
  const txBytes = TxRaw.encode(txRaw).finish();
  const txHash = sha256(txBytes);
  const deliverTxPromise = stargateClient.broadcastTx(txBytes);
  return {
    txHash,
    txID: Buffer.from(txHash).toString('hex').toUpperCase(),
    getResponse: async () => await deliverTxPromise,
  };
}

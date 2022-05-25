import { StargateClient } from "@cosmjs/stargate";

import { RPC_ENDPOINT } from "@/config";

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

export async function broadcastTx(/* TODO */) {
  const stargateClient = await initStargateClient();
  // const txBytes = // TODO
  // return stargateClient.broadcastTx(txBytes);
}

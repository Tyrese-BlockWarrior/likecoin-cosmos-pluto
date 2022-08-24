// Code originated from https://github.com/chainapsis/keplr-wallet/blob/29740dc64bbc10e42fda481239d0e20387a74007/packages/wc-client-example/src/get-wc-keplr.ts

import { Keplr } from "@keplr-wallet/types";
import WalletConnect from "@walletconnect/client";
import { KeplrQRCodeModalV1 } from "@keplr-wallet/wc-qrcode-modal";
import { KeplrWalletConnectV1 } from "@keplr-wallet/wc-client";
import Axios from "axios";
import { KEPLR_CHAIN_INFO, WALLET_CONNECT_BRIDGE } from "@/config";
import { Buffer } from "buffer/";

let keplr: Keplr | undefined = undefined;
let promise: Promise<Keplr> | undefined = undefined;

async function sendTx(
  chainId: string,
  tx: Uint8Array,
  mode: "block" | "sync" | "async",
): Promise<Uint8Array> {
  const params = {
    tx_bytes: Buffer.from(tx as any).toString("base64"),
    mode: (() => {
      switch (mode) {
        case "async":
          return "BROADCAST_MODE_ASYNC";
        case "block":
          return "BROADCAST_MODE_BLOCK";
        case "sync":
          return "BROADCAST_MODE_SYNC";
        default:
          return "BROADCAST_MODE_UNSPECIFIED";
      }
    })(),
  };

  const restInstance = Axios.create({
    baseURL: KEPLR_CHAIN_INFO.rest,
  });

  const result = await restInstance.post("/cosmos/tx/v1beta1/txs", params);

  return Buffer.from(result.data["tx_response"].txhash, "hex");
}

export function getWCKeplr(): Promise<Keplr> {
  if (keplr) {
    return Promise.resolve(keplr);
  }

  const fn = () => {
    const connector = new WalletConnect({
      bridge: WALLET_CONNECT_BRIDGE, // Required
      signingMethods: [
        "keplr_enable_wallet_connect_v1",
        "keplr_sign_amino_wallet_connect_v1",
      ],
      qrcodeModal: new KeplrQRCodeModalV1(),
    });

    // Check if connection is already established
    if (!connector.connected) {
      // create new session
      connector.createSession();

      return new Promise<Keplr>((resolve, reject) => {
        connector.on("connect", (error) => {
          if (error) {
            reject(error);
          } else {
            keplr = new KeplrWalletConnectV1(connector, {
              sendTx,
            });
            resolve(keplr);
          }
        });
      });
    } else {
      keplr = new KeplrWalletConnectV1(connector, {
        sendTx,
      });
      return Promise.resolve(keplr);
    }
  };

  if (!promise) {
    promise = fn();
  }

  return promise;
}

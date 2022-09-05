// Code originated from https://github.com/chainapsis/keplr-wallet/blob/29740dc64bbc10e42fda481239d0e20387a74007/packages/wc-client-example/src/get-wc-keplr.ts

import { Keplr } from "@keplr-wallet/types";
import WalletConnect from "@walletconnect/client";
import { KeplrQRCodeModalV1 } from "@keplr-wallet/wc-qrcode-modal";
import { KeplrWalletConnectV1 } from "@keplr-wallet/wc-client";
import { WALLET_CONNECT_BRIDGE } from "@/config";

let keplr: Keplr | undefined = undefined;
let promise: Promise<Keplr> | undefined = undefined;

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
            keplr = new KeplrWalletConnectV1(connector);
            resolve(keplr);
          }
        });
      });
    } else {
      keplr = new KeplrWalletConnectV1(connector);
      return Promise.resolve(keplr);
    }
  };

  if (!promise) {
    promise = fn();
  }

  return promise;
}

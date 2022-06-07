import {
  OfflineAminoSigner, pubkeyToAddress,
} from "@cosmjs/amino";
import { defineStore } from "pinia";
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { loadKeplr } from "@/keplr";
import { PubKey } from "@/cosmos/pubkey";

import { BECH32_PREFIX, CHAIN_ID } from "@/config";

export const useSignerStore = defineStore('signer', {
  state: () => ({
    offlineSigner: null as (OfflineDirectSigner & OfflineAminoSigner) | null,
    publicKey: null as PubKey | null,
  }),
  getters: {
    address: (state) => state.publicKey === null ? '' : pubkeyToAddress(state.publicKey.aminoPubKey, BECH32_PREFIX),
  },
  actions: {
    async getFromBrowserKeplr() {
      const keplr = await loadKeplr(CHAIN_ID, {
        disableBalanceCheck: true,
        preferNoSetFee: true,
        preferNoSetMemo: true,
      });
      const account = (await keplr.getAccounts())[0];
      this.offlineSigner = keplr;
      this.publicKey = PubKey.fromKeplrAccount(account)
    },
  },
});

export default useSignerStore;

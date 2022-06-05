import {
  OfflineAminoSigner, pubkeyToAddress,
} from "@cosmjs/amino";
import { defineStore } from "pinia";
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { loadKeplr } from "@/keplr";
import { PubKey } from "@/cosmos/pubkey";
import { readAccountChainInfo } from "@/cosmos/client";

import { BECH32_PREFIX, CHAIN_ID } from "@/config";

export const useAccountStore = defineStore('account', {
  state: () => ({
    publicKey: null as PubKey | null,
    signer: null as (OfflineDirectSigner & OfflineAminoSigner) | null,
    signerPublicKey: null as PubKey | null,
    sequence: 0,
    accountNumber: 0,
  }),
  getters: {
    signerAddress: (state) => state.signerPublicKey === null ? '' : pubkeyToAddress(state.signerPublicKey.aminoPubKey, BECH32_PREFIX),
    address: (state) => state.publicKey === null ? '' : pubkeyToAddress(state.publicKey.aminoPubKey, BECH32_PREFIX),
  },
  actions: {
    async readAccountChainInfo() {
      const acc = await readAccountChainInfo(this.address);
      this.accountNumber = acc.accountNumber;
      this.sequence = acc.sequence;
      return acc;
    },
    async updatePubKeyAndReadChain(pubKey: PubKey) {
      this.publicKey = pubKey;
      await this.readAccountChainInfo();
    },
    async getFromKeplr() {
      const keplr = await loadKeplr(CHAIN_ID, {
        disableBalanceCheck: true,
        preferNoSetFee: true,
        preferNoSetMemo: true,
      });
      const account = (await keplr.getAccounts())[0];
      this.signer = keplr;
      const pubKey = PubKey.fromKeplrAccount(account);
      this.updatePubKeyAndReadChain(pubKey);
      this.signerPublicKey = pubKey
    },
  },
});

export default useAccountStore;

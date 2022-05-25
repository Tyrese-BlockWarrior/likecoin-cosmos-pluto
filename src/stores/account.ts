import {
  OfflineAminoSigner,
  Pubkey as AminoPubKey,
} from "@cosmjs/amino";
import { defineStore } from "pinia";
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { loadKeplr } from "@/keplr";
import { keplrAccountToAminoPubKey } from "@/pubkey";
import { readAccountChainInfo } from "@/cosmos/client";

import { CHAIN_ID } from "@/config";

export const useAccountStore = defineStore('account', {
  state: () => ({
    address: '',
    signer: null as (OfflineDirectSigner & OfflineAminoSigner) | null,
    signerAddress: '',
    signerPublicKey: null as AminoPubKey | null,
    sequence: 0,
    accountNumber: 0,
  }),
  actions: {
    async readAccountChainInfo() {
      const acc = await readAccountChainInfo(this.address);
      this.accountNumber = acc.accountNumber;
      this.sequence = acc.sequence;
      return acc;
    },
    async updateAddress(address: string) {
      this.address = address;
      await this.readAccountChainInfo();
    },
    async getFromKeplr() {
      const keplr = await loadKeplr(CHAIN_ID, {
        disableBalanceCheck: true,
        preferNoSetFee: true,
        preferNoSetMemo: true,
      });
      const account = (await keplr.getAccounts())[0];
      this.updateAddress(account.address);
      this.signer = keplr;
      this.signerAddress = account.address;
      this.signerPublicKey = keplrAccountToAminoPubKey(account);
    },
  },
});

export default useAccountStore;

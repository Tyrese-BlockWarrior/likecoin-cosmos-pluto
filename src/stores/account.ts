import * as Amino from "@cosmjs/amino";
import { defineStore } from "pinia";
import { OfflineSigner } from '@cosmjs/proto-signing';
import { CHAIN_ID } from "@/config";
import { initKeplr } from "@/keplr";
import { keplrAccountToAminoPubKey } from "@/pubkey";

export const useAccountStore = defineStore('account', {
  state: () => ({
    address: '',
    publicKey: null as Amino.Pubkey | null,
    signer: null as OfflineSigner | null,
  }),
  actions: {
    async getFromKeplr() {
      const keplr = await initKeplr(CHAIN_ID);
      const account = (await keplr.getAccounts())[0];
      this.address = account.address;
      this.publicKey = keplrAccountToAminoPubKey(account);
      this.signer = keplr;
    },
  }
});

export default useAccountStore;

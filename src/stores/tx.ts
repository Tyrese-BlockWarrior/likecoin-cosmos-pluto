import { defineStore } from "pinia";
import { Coin } from '@cosmjs/stargate';
import { EncodeObject } from "@cosmjs/proto-signing";

export const useTxStore = defineStore('tx', {
  state: () => ({
    msgs: [] as EncodeObject[],
    memo: '',
    fee: {
      amount: [] as Coin[],
      gas: '200000',
      payer: '',
      payee: '',
    },
  }),
  actions: {
    addMsg(msg: EncodeObject) {
      this.msgs.push(msg);
    },
    removeMsg(i: number) {
      this.msgs.splice(i, 1);
    },
    clearMsgs() {
      this.msgs = [];
    }
  }
});

export default useTxStore;

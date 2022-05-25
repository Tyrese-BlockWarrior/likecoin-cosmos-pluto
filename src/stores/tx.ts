import { defineStore } from "pinia";
import { EncodeObject } from "@cosmjs/proto-signing";

import { generateUnsignedTxJSON, parseUnsignedTxJSON, type UnsignedTxJSON } from "@/cosmos/tx";

export const useTxStore = defineStore('tx', {
  state: () => ({
    msgs: [] as EncodeObject[],
    memo: '',
    fee: {
      amount: 0,
      gasLimit: 200000,
      payer: '',
      granter: '',
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
    },
    exportUnsignedTx() {
      const { msgs, memo, fee } = this;
      return generateUnsignedTxJSON({ msgs, memo, fee });
    },
    importUnsignedTx(unsignedTxJSON: UnsignedTxJSON) {
      const { msgs, memo, fee } = parseUnsignedTxJSON(unsignedTxJSON);
      this.msgs = msgs;
      this.memo = memo;
      this.fee = fee;
    },
  },
});

export default useTxStore;

import { defineStore } from "pinia";
import { EncodeObject } from "@cosmjs/proto-signing";
import { StdSignDoc as AminoSignDoc } from '@cosmjs/amino';

import {
  generateUnsignedTxJSON,
  parseUnsignedTxJSON,
  type UnsignedTxJSON,
  aminoTypes,
} from "@/cosmos/tx";
import { CHAIN_ID, DENOM } from "@/config";

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
    unsignedTxJSON: null as UnsignedTxJSON | null,
  }),
  getters: {
    aminoSignDoc: (state) => (accountNumber: number, sequence: number): AminoSignDoc => ({
      account_number: accountNumber.toFixed(),
      sequence: sequence.toFixed(),
      chain_id: CHAIN_ID,
      fee: {
        amount: [{
          amount: state.fee.amount.toFixed(),
          denom: DENOM,
        }],
        gas: state.fee.gasLimit.toFixed(),
      },
      memo: state.memo,
      msgs: state.msgs.map((msg) => aminoTypes.toAmino(msg)),
    }),
  },
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
    generateUnsignedTxJSON() {
      const { msgs, memo, fee } = this;
      this.unsignedTxJSON = generateUnsignedTxJSON({ msgs, memo, fee });
    },
    importUnsignedTx(unsignedTxJSON: UnsignedTxJSON) {
      const { msgs, memo, fee } = parseUnsignedTxJSON(unsignedTxJSON);
      this.msgs = msgs;
      this.memo = memo;
      this.fee = fee;
      this.unsignedTxJSON = unsignedTxJSON;
    },
  },
});

export default useTxStore;

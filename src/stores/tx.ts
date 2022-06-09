import { defineStore } from "pinia";

import { Registry, EncodeObject, TxBodyEncodeObject } from "@cosmjs/proto-signing";
import {
  StdSignDoc as AminoSignDoc,
} from '@cosmjs/amino';
import { defaultRegistryTypes } from "@cosmjs/stargate";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import {
  generateUnsignedTxJSON,
  parseUnsignedTxJSON,
  type UnsignedTxJSON,
  aminoTypes,
toStdFee,
amountToCoins,
} from "@/cosmos/tx";
import { CHAIN_ID } from "@/config";

export const registry = new Registry(defaultRegistryTypes);

export const useTxStore = defineStore("tx", {
  state: () => ({
    msgs: [] as EncodeObject[],
    memo: "",
    fee: {
      amount: 0,
      gasLimit: 200000,
      payer: "",
      granter: "",
    },
    signedTxRaw: null as TxRaw | null,
  }),
  getters: {
    unsignedTxJSON: (state) => {
      const { msgs, memo, fee } = state;
      return generateUnsignedTxJSON({ msgs, memo, fee });
    },
    aminoSignDoc: (state) =>
      (accountNumber: number, sequence: number): AminoSignDoc => ({
        account_number: accountNumber.toFixed(),
        sequence: sequence.toFixed(),
        chain_id: CHAIN_ID,
        fee: {
          amount: amountToCoins(state.fee.amount),
          gas: state.fee.gasLimit.toFixed(),
        },
        memo: state.memo,
        msgs: state.msgs.map((msg) => aminoTypes.toAmino(msg)),
      }),
    stdFee: (state) => toStdFee(state.fee),
    txBodyBytes: (state) => {
      const { msgs, memo } = state;
      const txBody: TxBodyEncodeObject = {
        typeUrl: "/cosmos.tx.v1beta1.TxBody",
        value: {
          messages: msgs,
          memo: memo,
        },
      };
      return registry.encode(txBody);
    },
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
    importUnsignedTx(unsignedTxJSON: UnsignedTxJSON) {
      const { msgs, memo, fee } = parseUnsignedTxJSON(unsignedTxJSON);
      this.msgs = msgs;
      this.memo = memo;
      this.fee = fee;
    },
  },
});

export default useTxStore;

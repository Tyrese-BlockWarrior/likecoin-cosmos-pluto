<template>
  <div>
    <div>
      Send to address: <input v-model.trim="toAddress">
    </div>
    <div>
      Amount: <input v-model.trim.number="amount"> {{ COIN_NAME }}
    </div>
    <button @click="addMsg">Add msg</button>
  </div>
</template>

<script setup lang="ts">
import { MsgSendEncodeObject } from '@cosmjs/stargate';
import { ref } from 'vue';

import { useAccountStore, useTxStore } from '@/stores';
import { humanAmountToDenomAmount } from '@/cosmos/tx';
import { COIN_NAME } from '@/config';

const toAddress = ref('');
const amount = ref(0);

const accountStore = useAccountStore();
const txStore = useTxStore();

function addMsg() {
  const msg: MsgSendEncodeObject = {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    value: {
      fromAddress: accountStore.address,
      toAddress: toAddress.value,
      amount: [humanAmountToDenomAmount(amount.value)],
    },
  };
  txStore.msgs.push(msg);
}
</script>

<template>
  <div>
    <div>
      From validator address: <input v-model.trim="fromValidator">
    </div>
    <div>
      To validator address: <input v-model.trim="toValidator">
    </div>
    <div>
      Amount: <input v-model.trim.number="amount"> {{ COIN_NAME }}
    </div>
    <button @click="addMsg">Add msg</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MsgBeginRedelegateEncodeObject } from '@/cosmos/msgs';

import { useTxStore } from '@/stores';
import { humanAmountToDenomAmount } from '@/cosmos/tx';
import { COIN_NAME } from '@/config';

const props = defineProps<{
  fromAddress: string
}>();

const fromValidator = ref('');
const toValidator = ref('');
const amount = ref(0);

const store = useTxStore();

function addMsg() {
  const msg: MsgBeginRedelegateEncodeObject = {
    typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
    value: {
      delegatorAddress: props.fromAddress,
      validatorSrcAddress: fromValidator.value,
      validatorDstAddress: toValidator.value,
      amount: humanAmountToDenomAmount(amount.value),
    },
  };
  store.msgs.push(msg);
}
</script>

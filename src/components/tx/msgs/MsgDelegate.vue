<template>
  <div>
    <div>
      Validator address: <input v-model.trim="validator">
    </div>
    <div>
      Amount: <input v-model.trim.number="amount"> {{ COIN_NAME }}
    </div>
    <button @click="addMsg">Add msg</button>
  </div>
</template>

<script setup lang="ts">
import { MsgDelegateEncodeObject } from '@cosmjs/stargate';
import { ref } from 'vue';

import { useTxStore } from '@/stores';
import { humanAmountToDenomAmount } from '@/cosmos/tx';
import { COIN_NAME } from '@/config';

const props = defineProps<{
  fromAddress: string
}>();

const validator = ref('');
const amount = ref(0);

const store = useTxStore();

function addMsg() {
  const msg: MsgDelegateEncodeObject = {
    typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
    value: {
      delegatorAddress: props.fromAddress,
      validatorAddress: validator.value,
      amount: humanAmountToDenomAmount(amount.value),
    },
  };
  store.msgs.push(msg);
}
</script>

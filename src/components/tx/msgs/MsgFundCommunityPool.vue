<template>
  <div>
    <div>
      Amount: <input v-model.trim.number="amount"> {{ COIN_NAME }}
    </div>
    <button @click="addMsg">Add msg</button>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { MsgFundCommunityPoolEncodeObject } from '@/cosmos/msgs';

import { useTxStore } from '@/stores';
import { humanAmountToDenomAmount } from '@/cosmos/tx';
import { COIN_NAME } from '@/config';

const props = defineProps<{
  fromAddress: string
}>();

const amount = ref(0);

const store = useTxStore();

function addMsg() {
  const msg: MsgFundCommunityPoolEncodeObject = {
    typeUrl: '/cosmos.distribution.v1beta1.MsgFundCommunityPool',
    value: {
      depositor: props.fromAddress,
      amount: [humanAmountToDenomAmount(amount.value)],
    },
  };
  store.msgs.push(msg);
}
</script>

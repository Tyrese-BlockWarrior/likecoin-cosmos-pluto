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

import { useAccountStore } from '@/stores/account';
import { useTxStore } from '@/stores/tx';
import { humanAmountToDenomAmount } from '@/cosmos/tx';
import { COIN_NAME } from '@/config';

const amount = ref(0);

const accountStore = useAccountStore();
const txStore = useTxStore();

function addMsg() {
  const msg: MsgFundCommunityPoolEncodeObject = {
    typeUrl: '/cosmos.distribution.v1beta1.MsgFundCommunityPool',
    value: {
      depositor: accountStore.address,
      amount: [humanAmountToDenomAmount(amount.value)],
    },
  };
  txStore.msgs.push(msg);
}
</script>

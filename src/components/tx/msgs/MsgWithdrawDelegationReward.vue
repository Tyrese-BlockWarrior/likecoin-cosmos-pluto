<template>
  <div>
    <div>
      Validator address: <input v-model.trim="validator">
    </div>
    <button @click="addMsg">Add msg</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MsgWithdrawDelegatorRewardEncodeObject } from '@cosmjs/stargate';

import { useTxStore } from '@/stores';

const props = defineProps<{
  fromAddress: string
}>();

const validator = ref('');

const store = useTxStore();

function addMsg() {
  const msg: MsgWithdrawDelegatorRewardEncodeObject = {
    typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    value: {
      delegatorAddress: props.fromAddress,
      validatorAddress: validator.value,
    },
  };
  store.msgs.push(msg);
}
</script>

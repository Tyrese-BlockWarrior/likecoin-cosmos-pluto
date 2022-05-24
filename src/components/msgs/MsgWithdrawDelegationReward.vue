<template>
  <div>
    <h3>Withdraw Rewards</h3>
    <div>
      Validator address: <input v-model.trim="validator">
    </div>
    <button @click="addMsg">Add msg</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MsgWithdrawDelegatorRewardEncodeObject } from '@cosmjs/stargate';

import { useAccountStore } from '@/stores/account';
import { useTxStore } from '@/stores/tx';

const validator = ref('');

const accountStore = useAccountStore();
const txStore = useTxStore();

function addMsg() {
  const msg: MsgWithdrawDelegatorRewardEncodeObject = {
    typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    value: {
      delegatorAddress: accountStore.address,
      validatorAddress: validator.value,
    },
  };
  txStore.msgs.push(msg);
}
</script>

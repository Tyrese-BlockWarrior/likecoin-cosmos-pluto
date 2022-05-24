<template>
  <div>
    <h3>Undelegate</h3>
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
import { ref } from 'vue';
import { MsgUndelegateEncodeObject } from '@cosmjs/stargate';

import { useAccountStore } from '@/stores/account';
import { useTxStore } from '@/stores/tx';
import { humanAmountToDenomAmount } from '@/cosmos/tx';
import { COIN_NAME } from '@/config';

const validator = ref('');
const amount = ref(0);

const accountStore = useAccountStore();
const txStore = useTxStore();

function addMsg() {
  const msg: MsgUndelegateEncodeObject = {
    typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
    value: {
      delegatorAddress: accountStore.address,
      validatorAddress: validator.value,
      amount: humanAmountToDenomAmount(amount.value),
    },
  };
  txStore.msgs.push(msg);
}
</script>

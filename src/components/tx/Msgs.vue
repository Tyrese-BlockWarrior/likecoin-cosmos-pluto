<template>
  <div>
    <h3>Msg List</h3>
    <ul>
      <li v-for="(msg, i) in txStore.msgs">
        <button @click="txStore.removeMsg(i)">X</button>
        Msg {{i}}: {{msg}}
      </li>
    </ul>
    <button @click="txStore.clearMsgs">Clear all msgs</button>
  </div>
  <div>
    <select v-model="selectedMsgComponent">
      <option disabled="true"> Select msg to add </option>
      <option v-for="(_, name) of msgComponents">
        {{ name }}
      </option>
    </select>
    <div>
      <KeepAlive>
        <component :is="msgComponents[selectedMsgComponent]" :from-address="props.fromAddress" />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';

import { useTxStore } from '@/stores';

import {
  MsgSend,
  MsgDelegate,
  MsgUndelegate,
  MsgBeginRedelegate,
  MsgWithdrawDelegationReward,
  MsgFundCommunityPool,
} from '@/components/tx/msgs';

const props = defineProps<{
  fromAddress: string
}>();

const txStore = useTxStore();

const msgComponents = { 
  MsgSend,
  MsgDelegate,
  MsgUndelegate,
  MsgBeginRedelegate,
  MsgWithdrawDelegationReward,
  MsgFundCommunityPool,
} as const;

const selectedMsgComponent = shallowRef('MsgSend' as keyof typeof msgComponents);
</script>

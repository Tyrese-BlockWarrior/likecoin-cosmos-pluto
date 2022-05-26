<template>
  <div>
    <h2>Msg List</h2>
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
        <component :is="msgComponents[selectedMsgComponent]" />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';

import { useTxStore } from '@/stores/tx';

import MsgSend from '@/components/tx/msgs/MsgSend.vue';
import MsgDelegate from '@/components/tx/msgs/MsgDelegate.vue';
import MsgUndelegate from '@/components/tx/msgs/MsgUndelegate.vue';
import MsgBeginRedelegate from '@/components/tx/msgs/MsgBeginRedelegate.vue';
import MsgWithdrawDelegationReward from '@/components/tx/msgs/MsgWithdrawDelegationReward.vue';
import MsgFundCommunityPool from '@/components/tx/msgs/MsgFundCommunityPool.vue';

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

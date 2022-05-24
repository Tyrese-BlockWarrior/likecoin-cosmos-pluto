<template>
  <div>
    <div>
      <h2>Msg List</h2>
      <ul>
        <li v-for="(msg, i) in store.msgs">
          <button @click="store.removeMsg(i)">X</button>
          Msg {{i}}: {{msg}}
        </li>
      </ul>
      <button @click="store.clearMsgs">Clear all msgs</button>
    </div>
    <div>
      <h2>Add Msg</h2>
      <div>
        <button v-for="(msgComponent, name) of msgComponents" @click="selectedMsgComponent = msgComponent">
          {{ name }}
        </button>
      </div>
      <div>
        <component :is="selectedMsgComponent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';

import { useTxStore } from '@/stores/tx';
import MsgSend from './MsgSend.vue';
import MsgDelegate from './MsgDelegate.vue';
import MsgUndelegate from './MsgUndelegate.vue';
import MsgBeginRedelegate from './MsgBeginRedelegate.vue';
import MsgWithdrawDelegationReward from './MsgWithdrawDelegationReward.vue';
import MsgFundCommunityPool from './MsgFundCommunityPool.vue';

type MsgComponent = typeof MsgSend;

const msgComponents = { 
  MsgSend,
  MsgDelegate,
  MsgUndelegate,
  MsgBeginRedelegate,
  MsgWithdrawDelegationReward,
  MsgFundCommunityPool,
} as const;

const selectedMsgComponent = shallowRef(MsgSend as MsgComponent);

const store = useTxStore();
</script>

<template>
  <div>
    <Msgs :from-address="multisigStopre.address" />
    <Fee />
    <div>
      <h3>Memo</h3>
      <input v-model.trim="txStore.memo" placeholder="Memo"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import Msgs from './Msgs.vue';
import Fee from './Fee.vue';

import { useTxStore, useMultisigStore } from '@/stores';

const txStore = useTxStore();
const multisigStopre = useMultisigStore();
</script>

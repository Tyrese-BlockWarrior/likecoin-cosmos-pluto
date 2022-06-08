<template>
  <div>
    <h2>Construct tx</h2>
    <Msgs :from-address="multisigStopre.address" />
    <Fee />
    <div>
      <h3>Memo</h3>
      <input v-model.trim="txStore.memo" placeholder="Memo"/>
    </div>
    <div>
      <h3>Unsigned tx</h3>
      <UnsignedTx />
    </div>
  </div>
</template>

<script setup lang="ts">
import Msgs from './Msgs.vue';
import Fee from './Fee.vue';
import UnsignedTx from './UnsignedTx.vue';

import { useTxStore, useMultisigStore } from '@/stores';

const txStore = useTxStore();
const multisigStopre = useMultisigStore();
</script>

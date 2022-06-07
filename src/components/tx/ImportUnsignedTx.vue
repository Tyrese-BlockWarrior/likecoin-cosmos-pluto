<template>
  <div>
    <button @click="importUnsignedTx">Import</button>
    <UnsignedTx />
  </div>
</template>

<script setup lang="ts">
import UnsignedTx from './/UnsignedTx.vue';

import { useTxStore } from '@/stores';

import { selectAndImportFile } from '@/utils/utils';

const store = useTxStore();

async function importUnsignedTx(e: any) {
  const content = await selectAndImportFile();
  const unsignedTxJSON = JSON.parse(content);
  store.importUnsignedTx(unsignedTxJSON)
}
</script>

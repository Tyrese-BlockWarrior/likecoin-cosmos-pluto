<template>
  <div>
    <pre>{{ store.unsignedTxJSON ? JSON.stringify(store.unsignedTxJSON, null, 2) : '-' }}</pre>
  </div>
  <div>
    Not this tx? <button @click="importUnsignedTx">Import from file</button>
  </div>
</template>

<script setup lang="ts">
import { useTxStore } from '@/stores';

import { selectAndImportFile } from '@/utils/utils';

const store = useTxStore();

async function importUnsignedTx(e: any) {
  const content = await selectAndImportFile();
  const unsignedTxJSON = JSON.parse(content);
  store.importUnsignedTx(unsignedTxJSON)
}
</script>

<template>
  <Step :step="1">
    <h2>Step 1: Import multisig wallet Info</h2>
    <ImportMultisig />
  </Step>
  <Step :step="2">
    <h2>Step 2: Construct tx</h2>
    <ConstructTx />
  </Step>
  <Step :step="3">
    <h2>Step 3: Confirm tx content and export unsigned tx</h2>
    <UnsignedTx />
    <div>
      <button :disabled="txStore.unsignedTxJSON === null" @click="exportUnsignedTx">Export unsigned tx</button>
    </div>
  </Step>
</template>

<script setup lang="ts">
import Step from '@/components/Step.vue';
import ImportMultisig from '@/components/ImportMultisig.vue';
import ConstructTx from '@/components/tx/ConstructTx.vue';
import UnsignedTx from '@/components/tx/UnsignedTx.vue';

import { useStepStore, useTxStore } from '@/stores';
import { generateFileAndDownload } from '@/utils/utils';

const stepStore = useStepStore();
stepStore.setup(3);

const txStore = useTxStore();

async function exportUnsignedTx() {
  // TODO: add signer info
  const exported = JSON.stringify(txStore.unsignedTxJSON, null, 2);
  generateFileAndDownload(exported, 'unsigned-tx.json');
}
</script>

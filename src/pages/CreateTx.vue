<template>
  <StepRoot>
    <Step>
      <h2>Step 1: Import multisig wallet Info</h2>
      <ImportMultisig />
    </Step>
    <Step>
      <h2>Step 2: Construct tx</h2>
      <ConstructTx />
    </Step>
    <Step>
      <h2>Step 3: Confirm tx content and export unsigned tx</h2>
      <UnsignedTx />
      <div>
        <button :disabled="txStore.unsignedTxJSON === null" @click="exportUnsignedTx">Export unsigned tx as file</button>
      </div>
      <div>
        Or simply use this URL: <a :href="exportURL">{{ exportURL }}</a>
      </div>
    </Step>
  </StepRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Step from '@/components/Step.vue';
import StepRoot from '@/components/StepRoot.vue';
import ImportMultisig from '@/components/ImportMultisig.vue';
import ConstructTx from '@/components/tx/ConstructTx.vue';
import UnsignedTx from '@/components/tx/UnsignedTx.vue';

import { useTxStore, useMultisigStore } from '@/stores';
import { encode as encodeQueryString } from '@/stores/querystring';
import { generateFileAndDownload } from '@/utils/utils';

const txStore = useTxStore();
const multisigStore = useMultisigStore();

const exportURL = computed(() => {
  const multisigExportQS = encodeQueryString('multisig', multisigStore.exportCompact());
  const txExportQS = encodeQueryString('tx', txStore.unsignedTxJSON);
  const { protocol, host, pathname } = window.location;
  return `${protocol}//${host}${pathname}?${multisigExportQS}&${txExportQS}`;
});

async function exportUnsignedTx() {
  const json = {
    ...txStore.unsignedTxJSON,
    multisigInfo: multisigStore.export(),
  };
  const exported = JSON.stringify(json, null, 2);
  generateFileAndDownload(exported, `unsigned-tx-${multisigStore.exportTitle}.json`);
}
</script>

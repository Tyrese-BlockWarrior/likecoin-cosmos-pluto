<template>
  <h2>Create transaction</h2>
  <div v-if="!afterCreate">
    <Multisig />
    <ConstructTx />
    <button @click="afterCreate=true">Create!</button>
  </div>
  <div v-else>
    Here is the transaction content:
    <pre>{{ JSON.stringify(txStore.unsignedTxJSON, null, 2) }}</pre>
    <div>
      (Something wrong in the tx?<button @click="afterCreate=false">Go back</button>)
    </div>
    <div>
      Share this URL for signing using Pluto: <a :href="exportURL">{{ exportURL }}</a>
    </div>
    <div>
      If some multisigners prefer using CLI, you may <button :disabled="txStore.unsignedTxJSON === null" @click="exportUnsignedTx">export unsigned tx as file</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import Multisig from '@/components/Multisig.vue';
import ConstructTx from '@/components/tx/ConstructTx.vue';

import { useTxStore, useMultisigStore } from '@/stores';
import { encode as encodeQueryString } from '@/stores/querystring';
import { generateFileAndDownload } from '@/utils/utils';

const txStore = useTxStore();
const multisigStore = useMultisigStore();

const afterCreate = ref(false);

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

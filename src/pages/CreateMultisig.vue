<template>
  <h2>Create multisig wallet</h2>
  <div>
    <EditMultisig />
    <div v-if="store.pubKey">
      <div>
        Use this URL for creating transactions in the future: <a :href="exportURL">{{ exportURL }}</a>
      </div>
      <div>
        <button @click="exportMultisigWallet">Export multisig wallet definition as file</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import EditMultisig from '@/components/EditMultisig.vue';

import { useMultisigStore } from '@/stores';
import { encode as encodeQueryString } from '@/stores/querystring';
import { generateFileAndDownload, } from '@/utils/utils';

const store = useMultisigStore();

const exportURL = computed(() => {
  const multisigExportQS = encodeQueryString('multisig', store.exportCompact());
  const { protocol, host, pathname } = window.location;
  return `${protocol}//${host}${pathname}?${multisigExportQS}`;
});

async function exportMultisigWallet() {
  const multisignInfoJSON = store.export();
  const content = JSON.stringify(multisignInfoJSON, null, 2);
  generateFileAndDownload(content, `${store.exportTitle}.json`);
}
</script>

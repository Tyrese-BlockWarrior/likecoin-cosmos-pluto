<template>
  <button @click="importMultisigWallet">Import</button>
  <Multisig />
</template>

<script setup lang="ts">
import Multisig from '@/components/Multisig.vue';

import { useMultisigStore } from '@/stores';
import { selectAndImportFile } from '@/utils/utils';

const store = useMultisigStore();

async function importMultisigWallet() {
  const content = await selectAndImportFile();
  const multisignInfoJSON = JSON.parse(content);
  store.import(multisignInfoJSON);
}
</script>

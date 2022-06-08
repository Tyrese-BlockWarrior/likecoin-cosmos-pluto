<template>
  <div>
    <textarea v-model.trim="multisigCosmosInput" placeholder="paste Cosmos public key here">
    </textarea>
  </div>
  <button @click="importMultisigWalletFromInput">Import from text</button>
  <button @click="importMultisigWalletFromFile">Import from exported file</button>
  <Multisig />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import Multisig from '@/components/Multisig.vue';

import { useMultisigStore } from '@/stores';
import { selectAndImportFile } from '@/utils/utils';

const store = useMultisigStore();

const multisigCosmosInput = ref('');

async function importMultisigWalletFromInput() {
  store.importFromCosmos(multisigCosmosInput.value);
}

async function importMultisigWalletFromFile() {
  const content = await selectAndImportFile();
  const multisignInfoJSON = JSON.parse(content);
  store.import(multisignInfoJSON);
}
</script>

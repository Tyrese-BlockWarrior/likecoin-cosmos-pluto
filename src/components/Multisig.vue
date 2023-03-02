<template>
  <div>
    <div>
      Title: {{ store.title }} (<code>{{ multisigAddress }}</code>)
    </div>
    <div>
      <input type="checkbox" v-model="shouldDisplayDetails" /> Display multisig wallet details
    </div>
  </div>
  <div v-if="shouldDisplayDetails">
    <div>
      Description: <pre>{{ store.description.trim() || '(N/A)' }}</pre>
    </div>
    <div>
      Multisigners:
      <ul>
        <li v-for="({keyholder, address}) of displayMultisigners">
          {{ keyholder }} (<code>{{ address }}</code>)
        </li>
      </ul>
    </div>
    Threshold: {{ store.threshold }}-of-{{ store.multisigners.length }}
  </div>
  <div>
    (Not this multisig wallet? <button @click="importMultisigFromFile">Import from file</button> )
  </div>
</template>

<script setup lang="ts">
import { pubkeyToAddress } from '@cosmjs/amino';
import { ref, computed } from 'vue';

import { useMultisigStore } from '@/stores';
import { selectAndImportFile } from '@/utils/utils';
import { BECH32_PREFIX } from '@/config';

const store = useMultisigStore();

const displayMultisigners = computed(() => 
  store.multisigners.map(({ keyholder, pubKey }) => ({
    keyholder,
    address: pubKey.address(),
  }))
);
const multisigAddress = computed(() => {
  if (store.pubKey === null) {
    return '-';
  }
  return pubkeyToAddress(store.pubKey, BECH32_PREFIX);
});

const shouldDisplayDetails = ref(false);

async function importMultisigFromFile() {
  const content = await selectAndImportFile();
  const multisignInfoJSON = JSON.parse(content);
  store.import(multisignInfoJSON);
}
</script>

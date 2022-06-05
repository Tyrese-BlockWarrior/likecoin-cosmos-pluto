<template>
  <div>
    <div v-for="signature of signatures" v-bind:key="signature.address()">
      {{ signature }}
    </div>
    <button @click="importSignatures">Import signatures from files</button>
    <button @click="combineSignatures" :disabled="multisigPubKey === null">Combine signatures</button>
    <div>
      Combined signature: {{ combinedSignatureDisplay }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { useAccountStore, useTxStore } from '@/stores';
import { isMultisigThresholdPubkey } from '@cosmjs/amino';

import { SingleSignature } from '@/cosmos/signing';
import { encodeBase64, selectAndImportFiles } from '@/utils/utils';
import { makeMultisignedTx } from '@cosmjs/stargate';

const accountStore = useAccountStore();
const txStore = useTxStore();

const signatures = ref([] as SingleSignature[]);
const combinedSignatureDisplay = ref('');

const multisigPubKey = computed(() => {
  const aminoPubKey = accountStore.publicKey?.aminoPubKey;
  if (!aminoPubKey) {
    return null;
  }
  if (!isMultisigThresholdPubkey(aminoPubKey)) {
    return null;
  }
  return aminoPubKey;
});

async function importSignatures() {
  const contents = await selectAndImportFiles();
  signatures.value = [];
  for (const content of contents) {
    const json = JSON.parse(content);
    if (!SingleSignature.isSingleSignatureJSON(json)) {
      throw new Error(`Invalid file format for JSON file: ${json}`);
    }
    signatures.value.push(SingleSignature.fromJSON(json));
  }
}

function combineSignatures() {
  const signaturesMap = new Map<string, Uint8Array>();
  for (const signature of signatures.value) {
    signaturesMap.set(signature.address(), signature.signature);
  }
  const sequence = Number.parseInt(signatures.value[0].sequence, 10);
  const txRaw = makeMultisignedTx(multisigPubKey.value!, sequence, txStore.stdFee, txStore.txBodyBytes, signaturesMap)
  combinedSignatureDisplay.value = encodeBase64(txRaw.signatures[0]);
}

</script>

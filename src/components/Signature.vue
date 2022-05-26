<template>
  <div>
    Signature: {{ signatureStore.signatureBase64 }}
  </div>
  <div>
    <button :disabled="signatureStore.signature === null" @click="exportSignature">Export signature</button>
  </div>
</template>

<script setup lang="ts">
import { useSignatureStore } from '@/stores';
import { generateFileAndDownload } from '@/utils/utils';

const signatureStore = useSignatureStore();

function exportSignature() {
  const json = signatureStore.signature!.toJSON();
  const exported = JSON.stringify(json, null, 2);
  generateFileAndDownload(exported, 'signature.json');
}
</script>

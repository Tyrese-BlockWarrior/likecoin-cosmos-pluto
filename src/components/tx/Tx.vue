<template>
  <div>
    <Msgs />
    <Fee />
    <div>
      <h2>Memo</h2>
      <input v-model.trim="txStore.memo" placeholder="Memo"/>
    </div>
    <div>
      <h2>Tx</h2>
      <div>
        {{ txStore.unsignedTxJSON ?? '-' }}
      </div>
      <div>
        <button @click="txStore.generateUnsignedTxJSON()">Generate unsigned tx using the info above</button>
        <button @click="importUnsignedTx">Import unsigned tx</button>
        <button :disabled="txStore.unsignedTxJSON === null" @click="exportUnsignedTx">Export unsigned tx</button>
        <button :disabled="txStore.unsignedTxJSON === null || !accountStore.signer" @click="signTx">Sign tx</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Msgs from './Msgs.vue';
import Fee from './Fee.vue';

import { useAccountStore } from '@/stores/account';
import { useTxStore } from '@/stores/tx';
import { useSignatureStore } from '@/stores/signature';

import { generateFileAndDownload, selectAndImportFile } from '@/utils/utils';
import { signTxAmino } from '@/cosmos/signing';

const accountStore = useAccountStore();
const txStore = useTxStore();
const signatureStore = useSignatureStore();

async function importUnsignedTx(e: any) {
  const content = await selectAndImportFile();
  const unsignedTxJSON = JSON.parse(content);
  txStore.importUnsignedTx(unsignedTxJSON)
}

async function exportUnsignedTx() {
  const exported = JSON.stringify(txStore.unsignedTxJSON, null, 2);
  generateFileAndDownload(exported, 'unsigned-tx.json');
}

async function signTx() {
  const { accountNumber, sequence } = accountStore;
  const aminoSignDoc = txStore.aminoSignDoc(accountNumber, sequence);
  const signature = await signTxAmino(accountStore.signer!, accountStore.address, aminoSignDoc);
  signatureStore.signature = signature;
}
</script>

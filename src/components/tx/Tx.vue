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
        {{ aminoSignDoc }}
      </div>
      <div>
        <input ref="importUnsignedTxInput" type="file" @change="importUnsignedTxFileChange" style="display: none;">
        <button @click="importUnsignedTxButtonClick">Import unsigned tx</button>
        <button @click="exportUnsignedTx">Export unsigned tx</button>
        <button :disabled="!accountStore.signer" @click="signTx">Sign tx</button>
      </div>
    </div>
    <Signature />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import * as Base64 from '@protobufjs/base64';
import { StdSignDoc as AminoSignDoc } from '@cosmjs/amino';

import Msgs from './Msgs.vue';
import Fee from './Fee.vue';
import Signature from './Signature.vue';

import { useAccountStore } from '@/stores/account';
import { useTxStore } from '@/stores/tx';
import { useSignatureStore } from '@/stores/signature';

import { aminoTypes } from '@/cosmos/tx';
import { DENOM, CHAIN_ID } from '@/config';
import { generateFileAndDownload } from '@/utils/utils';
import { signTxAmino } from '@/cosmos/signing';

const accountStore = useAccountStore();
const txStore = useTxStore();
const signatureStore = useSignatureStore();

const aminoSignDoc = computed(() => getAminoSignDoc());

function getAminoSignDoc(): AminoSignDoc {
  return {
    account_number: accountStore.accountNumber.toFixed(),
    sequence: accountStore.sequence.toFixed(),
    chain_id: CHAIN_ID,
    fee: {
      amount: [{
        amount: txStore.fee.amount.toFixed(),
        denom: DENOM,
      }],
      gas: txStore.fee.gasLimit.toFixed(),
    },
    memo: txStore.memo,
    msgs: txStore.msgs.map((msg) => aminoTypes.toAmino(msg)),
  };
}

const importUnsignedTxInput = ref();

function importUnsignedTxButtonClick() {
  importUnsignedTxInput.value.click();
}

async function importUnsignedTxFileChange(e: any) {
  const file = e.target.files[0] as File;
  const content = await file.text()
  const unsignedTxJSON = JSON.parse(content);
  txStore.importUnsignedTx(unsignedTxJSON)
}

async function exportUnsignedTx() {
  const unsignedTx = txStore.exportUnsignedTx();
  const exported = JSON.stringify(unsignedTx, null, 2);
  generateFileAndDownload(exported, 'unsigned-tx.json');
}

async function signTx() {
  const signature = await signTxAmino(accountStore.signer!, accountStore.address, aminoSignDoc.value);
  signatureStore.signature = signature;
}
</script>

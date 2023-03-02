<template>
  <div>
    <h2>Combine signatures and broadcast transaction</h2>
    <div>
      <h3>Wallet info</h3>
      <Multisig />
    </div>
    <div>
      <h3>Transaction info</h3>
      <ImportUnsignedTx />
    </div>
    <div>
      <button @click="importSignatures">Import and combine signatures from files</button>
    </div>
    <div>
      <h3>Imported signatures</h3>
      <ul>
        <li v-for="signature of signaturesDisplay" v-bind:key="signature.address">
          {{ signature.keyholder }} (<code>{{ signature.address }}</code>): <code>{{ signature.signatureBase64 }}</code>
        </li>
      </ul>
      <div>
        Combined signature: <code>{{ combinedSignatureDisplay }}</code>
      </div>
    </div>
    <div>
      <button :disabled="txStore.signedTxRaw === null || txStore.signedTxRaw.signatures[0].length === 0" @click="broadcastTx">Broadcast</button>
    </div>
    <div v-if="txHashDisplay">
      <div>
        Tx hash: <code>{{ txHashDisplay }}</code>
      </div>
      <div>
        Result: <code>{{ broadcastResponse || broadcastError || 'pending...' }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import Multisig from '@/components/Multisig.vue';
import ImportUnsignedTx from '@/components/tx/ImportUnsignedTx.vue';

import { makeMultisignedTx, DeliverTxResponse  } from '@cosmjs/stargate';

import { useMultisigStore, useTxStore } from '@/stores';

import { encodeBase64, encodeHex, selectAndImportFiles } from '@/utils/utils';
import { SingleSignature } from '@/cosmos/signing';
import { broadcastTx as cosmosBroadcastTx } from '@/cosmos/client';
import { encodeTx } from '@/cosmos/tx';

const multisigStore = useMultisigStore();
const txStore = useTxStore();

const signatures = ref([] as SingleSignature[]);
const signaturesDisplay = computed(() => 
  signatures.value.map((signature) => ({
    keyholder: signature.keyholder ?? '(unnamed)',
    address: signature.pubKey.address(),
    signatureBase64: encodeBase64(signature.signature),
  }))
);
const combinedSignatureDisplay = computed(() => {
  if (txStore.signedTxRaw === null) {
    return '-';
  }
  return encodeBase64(txStore.signedTxRaw.signatures[0]);
});
const txHashDisplay = ref('');


const broadcastResponse = ref(null as DeliverTxResponse | null);
const broadcastError = ref(null as any);
const broadcastPending = ref(false);

async function importSignatures() {
  const contents = await selectAndImportFiles();
  signatures.value = [];
  const signaturesMap = new Map<string, Uint8Array>();
  for (const content of contents) {
    const json = JSON.parse(content);
    if (!SingleSignature.isSingleSignatureJSON(json)) {
      throw new Error(`Invalid file format for JSON file: ${json}`);
    }
    const singleSignature = SingleSignature.fromJSON(json);
    signatures.value.push(singleSignature);
    signaturesMap.set(singleSignature.pubKey.address(), singleSignature.signature);
  }
  if (!signatures.value.every((sig) => sig.sequence === signatures.value[0].sequence)) {
    throw new Error('Not all signatures are signed using the same sequence');
  }
  const sequence = Number.parseInt(signatures.value[0].sequence, 10);
  const txRaw = makeMultisignedTx(multisigStore.pubKey!, sequence, txStore.stdFee, txStore.txBodyBytes, signaturesMap)
  txStore.signedTxRaw = txRaw;
  const { txHash } = encodeTx(txStore.signedTxRaw);
  console.log('Computed tx hash: ', encodeHex(txHash));
}

async function broadcastTx() {
  broadcastPending.value = true;
  try {
    const { txID, getResponse } = await cosmosBroadcastTx(txStore.signedTxRaw!);
    txHashDisplay.value = txID;
    broadcastResponse.value = null;
    broadcastError.value = null;
    const res = await getResponse();
    broadcastResponse.value = res;
  } catch (err) {
    console.log({err})
    broadcastError.value = err;
  } finally {
    broadcastPending.value = false;
  }
}
</script>

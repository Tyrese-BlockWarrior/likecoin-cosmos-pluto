<template>
  <StepRoot>

    <Step>
      <h2>Step 1: Import multisig wallet info</h2>
      <ImportMultisig />
    </Step>
    <Step>
      <h2>Step 2: Import unsigned tx</h2>
      <ImportUnsignedTx />
    </Step>
    <Step>
      <h2>Step 3: Import and combine signatures</h2>
      <div>
        <button @click="importSignatures">Import and combine signatures from files</button>
        <div v-for="signature of signatures" v-bind:key="signature.address()">
          {{ signature }}
        </div>
        <div>
          Combined signature: {{ combinedSignatureDisplay }}
        </div>
      </div>
    </Step>
    <Step>
      <h2>Step 4: Broadcast tx</h2>
      <div>
        Tx: {{ txStore.unsignedTxJSON }}
      </div>
      <div>
        Combined signature: {{ combinedSignatureDisplay }}
      </div>
      <div>
        <button @click="broadcastTx">Broadcast</button>
      </div>
      <div>
        Tx hash: {{ txHashDisplay }}
      </div>
      <div>
        Result:
        {{ broadcastResponse || broadcastError || '' }}
      </div>
    </Step>
  </StepRoot>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import Step from '@/components/Step.vue';
import StepRoot from '@/components/StepRoot.vue';
import ImportMultisig from '@/components/ImportMultisig.vue';
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
    signaturesMap.set(singleSignature.address(), singleSignature.signature);
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

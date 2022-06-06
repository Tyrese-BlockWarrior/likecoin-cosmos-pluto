<template>
  <div>
    <button :disabled="txStore.signedTxRaw === null || broadcastPending" @click="broadcastSignedTx">Broadcast tx</button>
  </div>
  <div>
    TxHash: {{ broadcastedTxHash }}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { DeliverTxResponse } from "@cosmjs/stargate";

import { useTxStore } from '@/stores';
import { broadcastTx } from '@/cosmos/client';

const txStore = useTxStore();

const broadcastResponse = ref(null as DeliverTxResponse | null);
const broadcastError = ref(null as any);
const broadcastedTxHash = ref('');
const broadcastPending = ref(false);

async function broadcastSignedTx() {
  broadcastPending.value = true;
  try {
    const { txID, getResponse } = await broadcastTx(txStore.signedTxRaw!);
    broadcastedTxHash.value = txID;
    broadcastResponse.value = null;
    broadcastError.value = null;
    const res = await getResponse();
    broadcastResponse.value = res;
  } catch (err) {
    broadcastError.value = err;
  } finally {
    broadcastPending.value = false;
  }
}
</script>

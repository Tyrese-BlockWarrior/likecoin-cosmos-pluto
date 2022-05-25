<template>
<div>
  <h2>Keplr Login</h2>
  <div>
    <div>
      Account address: {{ store.address || '-' }}
    </div>
    <div>
      (sequence: {{ store.sequence }}, account number: {{ store.accountNumber }})
    </div>
    <div>
      Signer address: {{ store.signerAddress || '-' }}
    </div>
  </div>
  <div>
    <button @click="readFromKeplr">Read from Keplr</button>
    <button :disabled="store.address === ''" @click="store.readAccountChainInfo()">Re-read sequence</button>
  </div>
</div>
</template>

<script lang="ts" setup>
import { useAccountStore } from '@/stores/account';

const store = useAccountStore();

async function readFromKeplr() {
  await store.getFromKeplr();
  await store.readAccountChainInfo();
}
</script>

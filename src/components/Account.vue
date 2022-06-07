<template>
<div>
  <h2>Keplr Login</h2>
  <div>
    <div>
      Signer address: {{ store.address || '-' }}
    </div>
  </div>
  <div>
    <button @click="readFromKeplr">Read from Keplr</button>
  </div>
</div>
</template>

<script lang="ts" setup>
import { useSignerStore } from '@/stores';

const store = useSignerStore();

async function readFromKeplr() {
  await store.getFromBrowserKeplr();
}
</script>

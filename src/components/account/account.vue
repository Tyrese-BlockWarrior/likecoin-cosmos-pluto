<template>
<div>
  <h2 class="text-2xl font-bold">Keplr Login</h2>
  <div>
    Current address: {{ store.address || '-' }}
  </div>
  <div>
    <button @click="store.getFromKeplr()">Read from Keplr</button>
  </div>
</div>
</template>

<script lang="ts" setup>
import { useAccountStore } from '@/stores/account';

const store = useAccountStore();
</script>

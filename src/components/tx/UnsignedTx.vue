<template>
  <div>
    {{ store.unsignedTxJSON ?? '-' }}
  </div>
</template>

<script setup lang="ts">
import { useTxStore } from '@/stores';

const store = useTxStore();
</script>

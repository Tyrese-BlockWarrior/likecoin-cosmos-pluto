<template>
  <h2>Combine signatures</h2>
  <div>
    <Multisig />
    <CombineSignatures />
    <BroadcastTx />
  </div>
</template>

<script setup lang="ts">
import Multisig from '@/components/Multisig.vue'
import CombineSignatures from '@/components/CombineSignatures.vue'
import BroadcastTx from '@/components/BroadcastTx.vue';
</script>

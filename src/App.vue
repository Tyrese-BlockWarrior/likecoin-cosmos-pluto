<script setup lang="ts">
import Account from '@/components/Account.vue';
import CreateMultisig from '@/components/CreateMultisig.vue';
import Tx from './components/tx/Tx.vue';
import Signature from './components/Signature.vue';
</script>

<template>
  <div>
    <h1>Pluto</h1>
    <Account />
    <CreateMultisig />
    <Tx />
    <Signature />
  </div>
</template>

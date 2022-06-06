<template>
  <h2>Create / Sign tx</h2>
  <div>
    <Account />
    <Multisig />
    <Tx />
    <Signature />
  </div>
</template>

<script setup lang="ts">
import Account from '@/components/Account.vue';
import Multisig from '@/components/Multisig.vue';
import Tx from '@/components/tx/Tx.vue';
import Signature from '@/components/Signature.vue';
</script>

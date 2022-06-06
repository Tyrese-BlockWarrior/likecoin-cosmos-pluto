<template>
  <h2>Create multisig wallet</h2>
  <div>
    <Account />
    <Multisig :edit="true" />
  </div>
</template>

<script setup lang="ts">
import Account from '@/components/Account.vue';
import Multisig from '@/components/Multisig.vue';
</script>

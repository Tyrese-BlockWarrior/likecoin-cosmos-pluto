<template>
  <h2>Create multisig wallet</h2>
  <div>
    <Account />
    <CreateMultisig :edit="true" />
  </div>
</template>

<script setup lang="ts">
import Account from '@/components/Account.vue';
import CreateMultisig from '@/components/CreateMultisig.vue';
</script>

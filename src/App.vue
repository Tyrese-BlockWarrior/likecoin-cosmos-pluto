<template>
  <h1>Pluto</h1>
  <div>
    <div>Select a function</div>
    <select v-model="selectedPage">
      <option disabled="true">Select function</option>
      <option v-for="(_, name) of pageComponents">
        {{ name }}
      </option>
    </select>
    <div>
      <component  v-if="selectedPage !== ''" :is="pageComponents[selectedPage]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue';

import {
  CreateMultisig,
  CreateTx,
  SignTx,
  CombineSignaturesAndBroadcastTx,
} from '@/pages';

const pageComponents = { 
  '': null,
  'Create multisig wallet': CreateMultisig,
  'Create tx': CreateTx,
  'Sign tx': SignTx,
  'Combine signatures and broadcast tx': CombineSignaturesAndBroadcastTx,
} as const;

const selectedPage = shallowRef('' as keyof typeof pageComponents);
</script>

<template>
  <h1>Pluto</h1>
  <div>
    <div>Select a function</div>
    <div>
      <span v-for="(_, name) of pageComponents">
        <button v-if="name !== ''" @click="selectedPage=name">{{ name }}</button>
      </span>
    </div>
    <div>
      <component v-if="selectedPage !== ''" :is="pageComponents[selectedPage]" />
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

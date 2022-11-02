<template>
  <h1>Pluto</h1>
  <Signer />
  <div>
    <div>Select a page</div>
    <div>
      <span v-for="(route, i) of routes">
        <button @click="selectPage(i)">{{ route.name }}</button>
      </span>
    </div>
    <div class="page-container">
      <router-view></router-view>
    </div>
  </div>
  <footer>Made by <a href="https://liker.land">Liker Land</a></footer>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
  useTxStore,
  useMultisigStore,
  useQueryStringStore
} from '@/stores';
import { routes } from '@/router';

import Signer from '@/components/Signer.vue';

const router = useRouter();

const txStore = useTxStore();
const multisigStore = useMultisigStore();
const queryStringStore = useQueryStringStore();

let importedUnsignedTx = false;
let importedMultisig = false;

const unsignedTxJSON = queryStringStore.consumeKey('tx');
if (unsignedTxJSON) {
  txStore.importUnsignedTx(unsignedTxJSON);
  importedUnsignedTx = true;
}

const multisigExportCompact = queryStringStore.consumeKey('multisig');
if (multisigExportCompact) {
  multisigStore.importCompact(multisigExportCompact);
  importedMultisig = true;
}

if (importedMultisig && importedUnsignedTx) {
  router.push('/sign');
} else if (importedMultisig) {
  router.push('/create-tx');
}

function selectPage(n: number) {
  const route = routes[n];
  router.push(route.path);
}
</script>

<style scoped>
.page-container {
  border: 2px solid;
  min-height: 500px;
}

footer {
  margin-top: 20px;
}
</style>

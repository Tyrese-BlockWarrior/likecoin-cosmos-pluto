<template>
  <h2>Create multisig wallet</h2>
  <ul>
    <li v-for="(accInfo, i) of accounts" v-bind:key="accInfo.address">
      <button @click="removePubKey(i)">X</button> {{ accInfo.keyholder }}: {{ accInfo.address }} (public key: {{ accInfo.pubKey }})
    </li>
  </ul>
  <div>
    <input v-model.trim="inputKeyholder" placeholder="Key holder name"/>
    <input v-model.trim="inputPubKey" placeholder="public key"/>
    <button @click="addPubKey">Add</button>
  </div>
  <div>
    Current public key: {{ accountStore.publicKey ?? '-' }}
    <button :disabled="accountStore.address === ''" @click="useCurrentAddress">
      Use this public key
    </button>
  </div>
  Multisig threshold: <input v-model.number="inputThreshold" placeholder="multisig threshold"/>
  <button @click="generateMultisigPubKey">Generate multisig public key</button>
  <div>
    Multisig address: {{ multisigAddress }} (public key: {{ multisigPubKey }})
  </div>
</template>

<script setup lang="ts">
import * as Amino from '@cosmjs/amino';
import { ref, computed } from 'vue';

import { useAccountStore } from '@/stores/account';
import { pubKeyToCosmosFormat, parsePubKey } from '@/pubkey';
import { BECH32_PREFIX } from '@/config';

type Multisigner = {
  keyholder: string,
  pubKey: Amino.Pubkey,
}

const multisigners = ref([] as Multisigner[]);
const accounts = computed(() => 
  multisigners.value.map(({ keyholder, pubKey }) => ({
    keyholder,
    address: Amino.pubkeyToAddress(pubKey, BECH32_PREFIX),
    pubKey: pubKeyToCosmosFormat(pubKey),
  }))
);
const multisigPubKey = ref(null as Amino.MultisigThresholdPubkey | null);
const multisigAddress = computed(() => {
  if (multisigPubKey.value === null) {
    return '';
  }
  return Amino.pubkeyToAddress(multisigPubKey.value, BECH32_PREFIX);
});

const inputPubKey = ref('');
const inputKeyholder = ref('');
const inputThreshold = ref(0);

const accountStore = useAccountStore();

function removePubKey(i: number) {
  multisigners.value.splice(i, 1);
  console.log(accounts.value);
}

function addPubKey() {
  const parsedPubKey = parsePubKey(inputPubKey.value);
  for (const { keyholder, pubKey } of multisigners.value) {
    if (inputKeyholder.value === keyholder && keyholder !== '') {
      throw new Error('keyholder name already exist');
    }
    if (pubKey.value === parsedPubKey.value) {
      throw new Error('public key already exist');
    }
  }
  multisigners.value.push({ keyholder: inputKeyholder.value, pubKey: parsedPubKey });
  inputPubKey.value = '';
  inputKeyholder.value = '';
}

function useCurrentAddress() {
  inputPubKey.value = pubKeyToCosmosFormat(accountStore.publicKey!);
}

function generateMultisigPubKey() {
  if (inputThreshold.value <= 0 || inputThreshold.value > multisigners.value.length) {
    throw new Error('Invalid threshold value');
  }
  const pubKey = Amino.createMultisigThresholdPubkey(multisigners.value.map(({ pubKey }) => pubKey), inputThreshold.value);
  multisigPubKey.value = pubKey;
}
</script>

<style scoped>
</style>

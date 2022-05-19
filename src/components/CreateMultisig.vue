<template>
  <ol>
    <li v-for="(accInfo, i) of accounts" v-bind:key="accInfo.address">
      Address {{i}}: {{ accInfo.address }} (public key: {{ accInfo.pubKey }}) <button @click="removePubKey(i)">X</button>
    </li>
  </ol>
  <div>
    <input v-model.trim="inputPubKey" placeholder="public key"/>
    <button @click="addPubKey">Add</button>
  </div>
  <div>
    <button @click="readPubKey">Read from Keplr</button>
  </div>
  <input v-model.number="inputThreshold" placeholder="multisig threshold"/>
  <button @click="generateMultisigPubKey">Generate multisig public key</button>
  <div>
    Multisig address: {{ multisigAddress }} (public key: {{ multisigPubKey }})
  </div>
</template>

<script setup lang="ts">
import * as Amino from '@cosmjs/amino';
import * as Base64 from '@protobufjs/base64';
import { ref, computed } from 'vue';

import { pubKeyToCosmosFormat, parsePubKey } from '../pubkey'
import { initKeplr } from '../keplr';
import { BECH32_PREFIX, CHAIN_ID } from '../config';

const emit = defineEmits<{
  (e: 'updateMultisigPubKey', value: Amino.MultisigThresholdPubkey): void
}>();

const pubKeys = ref([] as Amino.Pubkey[]);
const accounts = computed(() => 
  pubKeys.value.map((pubKey) => ({
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
const inputThreshold = ref(0);
const outputError = ref('' as Error | '');

function removePubKey(i: number) {
  pubKeys.value.splice(i, 1);
  console.log(accounts.value);
}

function addPubKey() {
  const accInfo = parsePubKey(inputPubKey.value);
  pubKeys.value.push(accInfo);
  inputPubKey.value = '';
}

async function readPubKey() {
  const signer = await initKeplr(CHAIN_ID);
  const account = (await signer.getAccounts())[0];
  const pubKeyBase64 = Base64.encode(account.pubkey, 0, account.pubkey.length);
  pubKeys.value.push({
    type: Amino.pubkeyType.secp256k1,
    value: pubKeyBase64,
  });
}

function generateMultisigPubKey() {
  if (inputThreshold.value <= 0 || inputThreshold.value > pubKeys.value.length) {
    throw new Error('Invalid threshold value');
  }
  const pubKey = Amino.createMultisigThresholdPubkey(pubKeys.value, inputThreshold.value);
  multisigPubKey.value = pubKey;
  emit('updateMultisigPubKey', pubKey);
}
</script>

<style scoped>
</style>

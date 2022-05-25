<template>
  <h2>Create multisig wallet</h2>
  <ul>
    <li v-for="(accInfo, i) of accounts" v-bind:key="accInfo.address">
      <button @click="removePubKey(i)">X</button> {{ accInfo.keyholder || '(unnamed)' }}: {{ accInfo.address }} (public key: {{ accInfo.pubKey }})
    </li>
  </ul>
  <div>
    <input v-model.trim="inputKeyholder" placeholder="Key holder name"/>
    <input v-model.trim="inputPubKey" placeholder="Public key"/>
    <button @click="addPubKey">Add</button>
  </div>
  <div>
    Current signing public key: {{ currentSignerPublicKey }}
    <button :disabled="accountStore.address === ''" @click="addCurrentSigner">
      Use this public key
    </button>
  </div>
  <div>
    <div>
      Multisig threshold: <input v-model.number="inputThreshold" placeholder="multisig threshold"/>
    </div>
    <div>
      <button @click="generateMultisigPubKey">Generate multisig public key</button>
    </div>
  </div>
  <div>
    <div>
      Multisig address: {{ multisigAddress }}
    </div>
    <div>
      Public Key: {{ multisigPubKey }}
    </div>
    <div>
      <button @click="importMultisigWallet">Import from JSON file</button>
      <button :disabled="!multisigAddress" @click="exportMultisigWallet">Export as JSON file</button>
      <button :disabled="!multisigAddress" @click="useMultisigAsAccountAddress">Use as account address</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Pubkey as AminoPubKey,
  MultisigThresholdPubkey,
  pubkeyToAddress,
  createMultisigThresholdPubkey
} from '@cosmjs/amino';
import { ref, computed } from 'vue';

import { useAccountStore } from '@/stores/account';
import { pubKeyToCosmosFormat, parsePubKey } from '@/pubkey';
import { BECH32_PREFIX } from '@/config';

type Multisigner = {
  keyholder: string,
  pubKey: AminoPubKey,
}

const accountStore = useAccountStore();

const multisigners = ref([] as Multisigner[]);
const accounts = computed(() => 
  multisigners.value.map(({ keyholder, pubKey }) => ({
    keyholder,
    address: pubkeyToAddress(pubKey, BECH32_PREFIX),
    pubKey: pubKeyToCosmosFormat(pubKey),
  }))
);
const currentSignerPublicKey = computed(() => {
  if (!accountStore.signerPublicKey) {
    return '-';
  }
  return pubKeyToCosmosFormat(accountStore.signerPublicKey);
})
const multisigPubKey = ref(null as MultisigThresholdPubkey | null);
const multisigAddress = computed(() => {
  if (multisigPubKey.value === null) {
    return '';
  }
  return pubkeyToAddress(multisigPubKey.value, BECH32_PREFIX);
});

const inputPubKey = ref('');
const inputKeyholder = ref('');
const inputThreshold = ref(1);

function removePubKey(i: number) {
  multisigners.value.splice(i, 1);
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

function addCurrentSigner() {
  inputPubKey.value = pubKeyToCosmosFormat(accountStore.signerPublicKey!);
}

function generateMultisigPubKey() {
  if (inputThreshold.value <= 0 || inputThreshold.value > multisigners.value.length) {
    throw new Error('Invalid threshold value');
  }
  const pubKey = createMultisigThresholdPubkey(multisigners.value.map(({ pubKey }) => pubKey), inputThreshold.value);
  multisigPubKey.value = pubKey;
}

async function importMultisigWallet() {
  // TODO
}

async function exportMultisigWallet() {
  // TODO
}

function useMultisigAsAccountAddress() {
  accountStore.updateAddress(multisigAddress.value);
}
</script>

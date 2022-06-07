<template>
  <h2>Multisig wallet</h2>
  <div>
    <h3>Wallet description</h3>
    <div>
      Title: 
      <input v-if="props.edit" type="text" v-model="multisigStore.title" placeholder="title" />
      <span v-else>{{ multisigStore.title }}</span>
    </div>
    <div>
      Description:
      <div>
        <textarea v-if="props.edit" v-model="multisigStore.description" placeholder="description"></textarea>
        <span v-else >{{ multisigStore.description }}</span>
      </div>
    </div>
  </div>
  <div>
    <h3>Multisigner addresses</h3>
    <ul>
      <li v-for="(accInfo, i) of displayMultisigners" v-bind:key="accInfo.address">
        <button v-if="props.edit" @click="removePubKey(i)">X</button> {{ accInfo.keyholder || '(unnamed)' }}: {{ accInfo.address }} (public key: {{ accInfo.pubKey }})
      </li>
    </ul>
  </div>
  <div v-if="props.edit">
    <h3>Add multisigner address</h3>
    <input v-model.trim="inputKeyholder" placeholder="Key holder name"/>
    <input v-model.trim="inputPubKey" placeholder="Public key"/>
    <button @click="addPubKey">Add</button>
    <div>
      <button @click="addCurrentSigner">Get my public key</button>
    </div>
  </div>
  <div>
    <div v-if="props.edit">
      Multisig threshold: <input v-model.number="multisigStore.threshold" placeholder="multisig threshold"/>
    </div>
    <div v-else>
      Multisig threshold: {{ multisigStore.threshold }}
    </div>
    <div v-if="props.edit">
      <button @click="generateMultisigPubKey">Generate multisig public key</button>
    </div>
  </div>
  <div>
    <h3>Multisig address info</h3>
    <div>
      Multisig address: {{ multisigAddress }}
    </div>
    <div>
      Public Key: {{ multisigStore.pubKey ?? '-' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { pubkeyToAddress } from '@cosmjs/amino';
import { ref, computed } from 'vue';

import { useSignerStore, useMultisigStore } from '@/stores';
import { PubKey } from '@/cosmos/pubkey';
import { BECH32_PREFIX } from '@/config';

const props = defineProps<{
  edit?: boolean
}>();

const signerStore = useSignerStore();
const multisigStore = useMultisigStore();

const displayMultisigners = computed(() => 
  multisigStore.multisigners.map(({ keyholder, pubKey }) => ({
    keyholder,
    address: pubkeyToAddress(pubKey.aminoPubKey, BECH32_PREFIX),
    pubKey: pubKey.toCosmosJSON(),
  }))
);
const multisigAddress = computed(() => {
  if (multisigStore.pubKey === null) {
    return '';
  }
  return pubkeyToAddress(multisigStore.pubKey, BECH32_PREFIX);
});

const inputPubKey = ref('');
const inputKeyholder = ref('');

function removePubKey(i: number) {
  multisigStore.multisigners.splice(i, 1);
}

function addPubKey() {
  const pubKey = PubKey.fromStringInput(inputPubKey.value);
  const addr = pubkeyToAddress(pubKey.aminoPubKey, BECH32_PREFIX);
  for (const { keyholder, pubKey: existingPubKey } of multisigStore.multisigners) {
    if (inputKeyholder.value === keyholder && keyholder !== '') {
      throw new Error('keyholder name already exist');
    }
    const existingAddr = pubkeyToAddress(existingPubKey.aminoPubKey, BECH32_PREFIX);
    if (addr === existingAddr) {
      throw new Error('public key already exist');
    }
  }
  multisigStore.multisigners.push({ keyholder: inputKeyholder.value, pubKey: pubKey });
  inputPubKey.value = '';
  inputKeyholder.value = '';
}

function addCurrentSigner() {
  inputPubKey.value = JSON.stringify(signerStore.publicKey!.toCosmosJSON());
}

function generateMultisigPubKey() {
  if (multisigStore.threshold <= 0 || multisigStore.threshold > multisigStore.multisigners.length) {
    throw new Error('Invalid threshold value');
  }
  multisigStore.generatePubKey();
}
</script>

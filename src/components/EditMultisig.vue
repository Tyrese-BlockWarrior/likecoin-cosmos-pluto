<template>
  <div>
    <h3>Wallet description</h3>
    <div>
      Title: 
      <input type="text" v-model="multisigStore.title" placeholder="title" />
    </div>
    <div>
      Description:
      <div>
        <textarea v-model="multisigStore.description" placeholder="description"></textarea>
      </div>
    </div>
  </div>
  <div>
    <h3>Multisigner addresses</h3>
    <ul>
      <li v-for="(accInfo, i) of displayMultisigners" v-bind:key="accInfo.address">
        <button @click="removePubKey(i)">X</button>
        <input type="text" v-model="multisigStore.multisigners[i].keyholder" placeholder="Enter keyholder name"/>
        : <code>{{ accInfo.address }}</code>
      </li>
    </ul>
  </div>
  <div>
    <h3>Add multisigner public key</h3>
    <div>
      <div> Current Keplr public key: {{ localPubKey }}</div>
      <button @click="addCurrentSigner">Add my Keplr public key</button>
    </div>
    <br/>
    <div>
      <div>Add public key:</div>
      <input v-model.trim="inputPubKey" placeholder="likepub1 or PubKey"/>
      <button @click="addPubKey(inputPubKey)">Add</button>
    </div>
  </div>
  <br/>
  <div>
    <div>
      Multisig threshold: <input v-model.number="multisigStore.threshold" placeholder="multisig threshold"/>
    </div>
  </div>
  <div>
    <h3>Multisig address info</h3>
    <div>
      Multisig address: <code>{{ multisigAddress }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { pubkeyToAddress } from '@cosmjs/amino';
import { ref, computed } from 'vue';

import { useSignerStore, useMultisigStore } from '@/stores';
import { PubKey } from '@/cosmos/pubkey';
import { BECH32_PREFIX } from '@/config';

const signerStore = useSignerStore();
const multisigStore = useMultisigStore();

const displayMultisigners = computed(() => 
  multisigStore.multisigners.map(({ keyholder, pubKey }) => ({
    keyholder,
    address: pubKey.address(),
    pubKey: pubKey.toCosmosJSON(),
  }))
);
const multisigAddress = computed(() => {
  const pubKey = multisigStore.pubKeyWithError as any;
  if (pubKey === null) {
    return '-';
  }
  if (pubKey.error) {
    return pubKey.error;
  }
  return pubkeyToAddress(multisigStore.pubKey!, BECH32_PREFIX);
});

const inputPubKey = ref('');
const localPubKey = computed(() => {
  const { publicKey } = signerStore;
  if (!publicKey) {
    return '-';
  }
  return JSON.stringify(publicKey!.toCosmosJSON());
});

function removePubKey(i: number) {
  multisigStore.multisigners.splice(i, 1);
}

function addPubKey(input: string) {
  const pubKey = PubKey.fromStringInput(input);
  const addr = pubKey.address();
  for (const { pubKey: existingPubKey } of multisigStore.multisigners) {
    const existingAddr = existingPubKey.address();
    if (addr === existingAddr) {
      throw new Error('public key already exist');
    }
  }
  multisigStore.multisigners.push({ keyholder: '', pubKey: pubKey });
  inputPubKey.value = '';
}

async function addCurrentSigner() {
  addPubKey(localPubKey.value);
}
</script>

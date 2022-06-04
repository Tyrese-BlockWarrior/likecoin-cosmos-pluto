<template>
  <h2>Create multisig wallet</h2>
  <ul>
    <li v-for="(accInfo, i) of displayMultisigners" v-bind:key="accInfo.address">
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
  MultisigThresholdPubkey,
  pubkeyToAddress,
} from '@cosmjs/amino';
import { ref, computed } from 'vue';

import { useAccountStore, useMultisigStore } from '@/stores';
import { PubKey } from '@/cosmos/pubkey';
import { BECH32_PREFIX } from '@/config';
import {
  selectAndImportFile,
  generateFileAndDownload,
} from '@/utils/utils';

const accountStore = useAccountStore();
const multisigStore = useMultisigStore();

const displayMultisigners = computed(() => 
  multisigStore.multisigners.map(({ keyholder, pubKey }) => ({
    keyholder,
    address: pubkeyToAddress(pubKey.aminoPubKey, BECH32_PREFIX),
    pubKey: pubKey.toCosmosJSON(),
  }))
);
const currentSignerPublicKey = computed(() => {
  if (!accountStore.signerPublicKey) {
    return '-';
  }
  return accountStore.signerPublicKey.toCosmosJSON();
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
  inputPubKey.value = JSON.stringify(accountStore.signerPublicKey!.toCosmosJSON());
}

function generateMultisigPubKey() {
  if (inputThreshold.value <= 0 || inputThreshold.value > multisigStore.multisigners.length) {
    throw new Error('Invalid threshold value');
  }
  multisigStore.threshold = inputThreshold.value;
  multisigPubKey.value = multisigStore.getMultisigPubKey();
}

async function importMultisigWallet() {
  const content = await selectAndImportFile();
  const multisignInfoJSON = JSON.parse(content);
  multisigStore.import(multisignInfoJSON);
  inputThreshold.value = multisigStore.threshold;
  multisigPubKey.value = multisigStore.getMultisigPubKey();
}

async function exportMultisigWallet() {
  const multisignInfoJSON = multisigStore.export();
  const content = JSON.stringify(multisignInfoJSON, null, 2);
  generateFileAndDownload(content, 'multisign-info.json');
}

function useMultisigAsAccountAddress() {
  accountStore.updateAndReadAddress(multisigAddress.value);
}
</script>

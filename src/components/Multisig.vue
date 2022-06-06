<template>
  <h2>Multisig wallet</h2>
  <ul>
    <li v-for="(accInfo, i) of displayMultisigners" v-bind:key="accInfo.address">
      <button v-if="props.edit" @click="removePubKey(i)">X</button> {{ accInfo.keyholder || '(unnamed)' }}: {{ accInfo.address }} (public key: {{ accInfo.pubKey }})
    </li>
  </ul>
  <div v-if="props.edit">
    <div>
      Key holder: <input v-model.trim="inputKeyholder" placeholder="Key holder name"/>
    </div>
    <div>
      <input v-model.trim="inputPubKey" placeholder="Public key"/>
    </div>
    <div>
      <button @click="addPubKey">Add</button>
    </div>
  </div>
  <div v-if="props.edit">
    Current signing public key: {{ currentSignerPublicKey }}
    <button :disabled="accountStore.signerAddress === ''" @click="addCurrentSigner">
      Use this public key
    </button>
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
    <div>
      Public Key: {{ multisigStore.pubKey ?? '-' }}
    </div>
      <div>
        Multisig address: {{ multisigAddress }}
      </div>
    <div>
      <button @click="importMultisigWallet">Import from JSON file</button>
      <button :disabled="!multisigAddress" @click="exportMultisigWallet">Export as JSON file</button>
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

const props = defineProps<{
  edit?: boolean
}>();

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
  inputPubKey.value = JSON.stringify(accountStore.signerPublicKey!.toCosmosJSON());
}

function generateMultisigPubKey() {
  if (multisigStore.threshold <= 0 || multisigStore.threshold > multisigStore.multisigners.length) {
    throw new Error('Invalid threshold value');
  }
  multisigStore.generatePubKey();
  updatePubKey();
}

async function importMultisigWallet() {
  const content = await selectAndImportFile();
  const multisignInfoJSON = JSON.parse(content);
  multisigStore.import(multisignInfoJSON);
  updatePubKey();
}

async function exportMultisigWallet() {
  const multisignInfoJSON = multisigStore.export();
  const content = JSON.stringify(multisignInfoJSON, null, 2);
  generateFileAndDownload(content, 'multisign-info.json');
}

function updatePubKey() {
  accountStore.updatePubKeyAndReadChain(new PubKey(multisigStore.pubKey!));
}
</script>

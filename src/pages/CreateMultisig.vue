<template>
  <Step :step="1">
    <h2>Step 1: Login Keplr</h2>
    <Account />
  </Step>
  <Step :step="2">
    <h2>Step 2: Input multisig wallet Info</h2>
    <Multisig :edit="true" />
  </Step>
  <Step :step="3">
    <h2>Step 3: Confirm and export multisig wallet definition as JSON file</h2>
    <button @click="exportMultisigWallet">Confirm and export</button>
    <Multisig />
  </Step>
</template>

<script setup lang="ts">
import Step from '@/components/Step.vue';
import Account from '@/components/Account.vue';
import Multisig from '@/components/Multisig.vue';

import { useStepStore, useMultisigStore } from '@/stores';
import { generateFileAndDownload, } from '@/utils/utils';

const stepStore = useStepStore();
stepStore.setup(3);

const multisigStore = useMultisigStore();

async function exportMultisigWallet() {
  const multisignInfoJSON = multisigStore.export();
  const content = JSON.stringify(multisignInfoJSON, null, 2);
  generateFileAndDownload(content, 'multisig-wallet.json');
}
</script>

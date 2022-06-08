<template>
  <Step :step="1">
    <h2>Step 1: Login Keplr</h2>
    <Account />
  </Step>
  <Step :step="2">
    <h2>Step 2 (optional): Import existing multisig key</h2>
    <div>
      If you have existing multisig public key (from liked CLI or from previously exported multisig definition), please import here and modify at the next step.
      Otherwise simply click "Next".
    </div>
    <ImportMultisig />
  </Step>
  <Step :step="3">
    <h2>Step 3: Input multisig wallet Info</h2>
    <Multisig :edit="true" />
  </Step>
  <Step :step="4">
    <h2>Step 4: Confirm and export multisig wallet definition as JSON file</h2>
    <button @click="exportMultisigWallet">Confirm and export</button>
    <Multisig />
  </Step>
</template>

<script setup lang="ts">
import Step from '@/components/Step.vue';
import Account from '@/components/Account.vue';
import ImportMultisig from '@/components/ImportMultisig.vue';
import Multisig from '@/components/Multisig.vue';

import { useStepStore, useMultisigStore } from '@/stores';
import { generateFileAndDownload, } from '@/utils/utils';

const stepStore = useStepStore();
stepStore.setup(4);

const multisigStore = useMultisigStore();

async function exportMultisigWallet() {
  const multisignInfoJSON = multisigStore.export();
  const content = JSON.stringify(multisignInfoJSON, null, 2);
  const filename = multisigStore.title.toLowerCase().split(/\s+/).join('-');
  generateFileAndDownload(content, `${filename || 'multisig-wallet'}.json`);
}
</script>

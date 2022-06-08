<template>
  <StepRoot>
    <Step>
      <h2>Step 1: Login Keplr</h2>
      <Account />
    </Step>
    <Step>
      <h2>Step 2 (optional): Import existing multisig key</h2>
      <div>
        If you have existing multisig public key (from liked CLI or from previously exported multisig definition), please import here and modify at the next step.
        Otherwise simply click "Next".
      </div>
      <ImportMultisig />
    </Step>
    <Step>
      <h2>Step 3: Input multisig wallet Info</h2>
      <Multisig :edit="true" />
    </Step>
    <Step>
      <h2>Step 4: Confirm and export multisig wallet definition as JSON file</h2>
      <button @click="exportMultisigWallet">Confirm and export</button>
      <Multisig />
    </Step>
  </StepRoot>
</template>

<script setup lang="ts">
import Step from '@/components/Step.vue';
import StepRoot from '@/components/StepRoot.vue';
import Account from '@/components/Account.vue';
import ImportMultisig from '@/components/ImportMultisig.vue';
import Multisig from '@/components/Multisig.vue';

import { useMultisigStore } from '@/stores';
import { generateFileAndDownload, } from '@/utils/utils';

const store = useMultisigStore();

async function exportMultisigWallet() {
  const multisignInfoJSON = store.export();
  const content = JSON.stringify(multisignInfoJSON, null, 2);
  generateFileAndDownload(content, `${store.exportTitle}.json`);
}
</script>

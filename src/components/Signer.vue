<template>
  <div>
    <div>
      <div v-if="store.inited">
        <div>Address: <code>{{ addressDisplay }}</code></div>
        <div>
          <input type="checkbox" v-model="shouldShowDetails" />Show details
        </div>
        <div v-if="shouldShowDetails">
          Public key: <code>{{ store.publicKey?.toCosmosJSON() }}</code>
        </div>
      </div>
      <button v-else @click="initKeplr">Init Keplr</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useSignerStore } from '@/stores';

const store = useSignerStore();

const shouldShowDetails = ref(false);

const addressDisplay = computed(() => {
  const { address } = store;
  if (!address) {
    return '-';
  }
  if (shouldShowDetails.value) {
    return address;
  }
  const LIMIT = 30; // TODO: put into config?
  if (address.length <= LIMIT) {
    return address;
  }
  const tailLength = 8;
  const headLength = LIMIT - tailLength - 3;
  return `${address.slice(0, headLength)}...${address.slice(address.length - tailLength)}`;
});

async function initKeplr() {
  store.init();
  await store.getFromBrowserKeplr();
}
</script>

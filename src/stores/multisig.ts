import {
  createMultisigThresholdPubkey, isMultisigThresholdPubkey, MultisigThresholdPubkey, pubkeyToAddress,
} from "@cosmjs/amino";
import { defineStore } from "pinia";
import { PubKey } from "@/cosmos/pubkey";
import { BECH32_PREFIX } from "@/config";

type Multisigner = {
  keyholder: string,
  pubKey: PubKey,
};

function generatePubKey(multisigners: Multisigner[], threshold: number) {
  return createMultisigThresholdPubkey(
    multisigners.map(({ pubKey }) => pubKey.aminoPubKey),
    threshold,
  );
}

function generateExport(title: string, description: string, multisigners: Multisigner[], threshold: number) {
  const pubKey = generatePubKey(multisigners, threshold);
  const address = pubkeyToAddress(pubKey, BECH32_PREFIX);
  return {
    title,
    description,
    address,
    pubKey,
    multisigners: multisigners.map(({ keyholder, pubKey }) => ({
      keyholder,
      address: pubkeyToAddress(pubKey.aminoPubKey, BECH32_PREFIX),
      pubKey: pubKey.toCosmosJSON(),
    })),
    threshold,
  };
}

export type MultisignInfoJSON = Pick<ReturnType<typeof generateExport>, 'multisigners' | 'threshold' | 'title' | 'description'>;

export const useMultisigStore = defineStore('multisig', {
  state: () => ({
    title: 'multisig-wallet',
    description: '',
    multisigners: [] as Multisigner[],
    threshold: 0,
    pubKey: null as MultisigThresholdPubkey | null,
  }),
  getters: {
    address: (state) => state.pubKey ? pubkeyToAddress(state.pubKey, BECH32_PREFIX) : '-',
    hasAddress: (state) => (address: string) =>
      state.pubKey === null ?
        false :
        state.pubKey.value.pubkeys.some((pubKey) => pubkeyToAddress(pubKey, BECH32_PREFIX) === address),
    exportTitle: (state) => {
      const title = state.title.trim();
      if (!title) {
        return 'multisig-wallet';
      }
      return title.toLowerCase().split(/\s+/).join('-');
    },
  },
  actions: {
    generatePubKey() {
      this.pubKey = generatePubKey(this.multisigners, this.threshold);
      return this.pubKey;
    },
    export() {
      return generateExport(this.title, this.description, this.multisigners, this.threshold);
    },
    import({ title, description, multisigners, threshold }: MultisignInfoJSON) {
      this.title = title;
      this.description = description;
      this.multisigners = multisigners.map(({ keyholder, pubKey }) => ({
        keyholder,
        pubKey: PubKey.fromCosmosJSON(pubKey),
      }));
      this.threshold = threshold;
      this.generatePubKey();
    },
    importFromCosmos(input: string) {
      const aminoPubKey = PubKey.fromStringInput(input).aminoPubKey;
      if (!isMultisigThresholdPubkey(aminoPubKey)) {
        throw new Error('Input public key is not a multisig public key');
      }
      this.pubKey = aminoPubKey;
      this.title = '';
      this.description = '';
      this.multisigners = aminoPubKey.value.pubkeys.map((pubKey) => ({
        keyholder: '',
        pubKey: new PubKey(pubKey),
      }));
      this.threshold = Number.parseInt(aminoPubKey.value.threshold, 10);
    },
  },
});

export default useMultisigStore;

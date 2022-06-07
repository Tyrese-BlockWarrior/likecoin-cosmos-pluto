import {
  createMultisigThresholdPubkey, MultisigThresholdPubkey, pubkeyToAddress,
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
  },
});

export default useMultisigStore;

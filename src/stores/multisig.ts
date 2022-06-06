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

function generateExport(multisigners: Multisigner[], threshold: number) {
  const pubKey = generatePubKey(multisigners, threshold);
  const address = pubkeyToAddress(pubKey, BECH32_PREFIX);
  return {
    multisigners: multisigners.map(({ keyholder, pubKey }) => ({
      keyholder,
      pubKey: pubKey.toCosmosJSON(),
    })),
    threshold,
    pubKey,
    address,
  };
}

export type MultisignInfoJSON = Pick<ReturnType<typeof generateExport>, 'multisigners' | 'threshold'>;

export const useMultisigStore = defineStore("multisig", {
  state: () => ({
    multisigners: [] as Multisigner[],
    threshold: 0,
    pubKey: null as MultisigThresholdPubkey | null,
  }),
  actions: {
    generatePubKey() {
      this.pubKey = generatePubKey(this.multisigners, this.threshold);
      return this.pubKey;
    },
    export() {
      return generateExport(this.multisigners, this.threshold);
    },
    import({ multisigners, threshold }: MultisignInfoJSON) {
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

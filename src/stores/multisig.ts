import {
  createMultisigThresholdPubkey,
} from "@cosmjs/amino";
import { defineStore } from "pinia";
import { PubKey } from "@/cosmos/pubkey";

type Multisigner = {
  keyholder: string,
  pubKey: PubKey,
};

function generateExport(multisigners: Multisigner[], threshold: number) {
  return {
    multisigners: multisigners.map(({ keyholder, pubKey }) => ({
      keyholder,
      pubKey: pubKey.toCosmosJSON(),
    })),
    threshold,
  };
}

export type MultisignInfoJSON = ReturnType<typeof generateExport>;

export const useMultisigStore = defineStore('multisig', {
  state: () => ({
    multisigners: [] as Multisigner[],
    threshold: 0,
  }),
  getters: {
    getMultisigPubKey: (state) => () => createMultisigThresholdPubkey(
      state.multisigners.map(({ pubKey }) => pubKey.toAminoPubKey()),
      state.threshold,
    ),
  },
  actions: {
    export() {
      return generateExport(this.multisigners, this.threshold);
    },
    import({ multisigners, threshold }: MultisignInfoJSON) {
      this.multisigners = multisigners.map(({ keyholder, pubKey }) => ({
        keyholder,
        pubKey: PubKey.fromCosmosJSON(pubKey),
      }));
      this.threshold = threshold;
    },
  },
});

export default useMultisigStore;

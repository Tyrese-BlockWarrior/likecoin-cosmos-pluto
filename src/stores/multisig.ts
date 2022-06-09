import { defineStore } from "pinia";

import {
  createMultisigThresholdPubkey, isMultisigThresholdPubkey, MultisigThresholdPubkey, pubkeyToAddress,
} from "@cosmjs/amino";
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
  }),
  getters: {
    address(): string {
      return this.pubKey ? pubkeyToAddress(this.pubKey, BECH32_PREFIX) : "-";
    } ,
    hasAddress(): (address: string) => boolean {
      return (address) =>
        this.pubKey === null ?
          false :
          this.pubKey.value.pubkeys.some((pubKey) => pubkeyToAddress(pubKey, BECH32_PREFIX) === address);
    },
    exportTitle: (state) => {
      const title = state.title.trim();
      if (!title) {
        return 'multisig-wallet';
      }
      return title.toLowerCase().split(/\s+/).join('-');
    },
    pubKeyWithError: (state) => {
      if (state.threshold <= 0 || state.threshold > state.multisigners.length) {
        return { error: new Error('invalid multisig threshold') };
      }
      try {
        return generatePubKey(state.multisigners, state.threshold);
      } catch (error) {
        return { error };
      }
    },
    pubKey(): MultisigThresholdPubkey | null {
      const pubKey = this.pubKeyWithError as any;
      if (!pubKey.error) {
        return pubKey as MultisigThresholdPubkey;
      }
      return null;
    },
    export: (state) => () => generateExport(state.title, state.description, state.multisigners, state.threshold),
    exportCompact: (state) => () => [
      state.title,
      state.description,
      state.multisigners.map(({ keyholder, pubKey }) => {
        const { '@type': type, ...value } = pubKey.toCosmosJSON();
        return [keyholder, type, value];
      }),
      state.threshold,
    ],
  },
  actions: {
    importCompact(data: any[]) {
      const [title, description, multisigners, threshold] = data;
      this.title = title;
      this.description = description;
      this.multisigners = multisigners.map(([keyholder, type, value]: any[]) => {
        const cosmosPubKeyJSON = { '@type': type, ...value };
        const pubKey = PubKey.fromCosmosJSON(cosmosPubKeyJSON);
        return { keyholder, pubKey };
      });
      this.threshold = threshold;
    },
    import({ title, description, multisigners, threshold }: MultisignInfoJSON) {
      this.title = title;
      this.description = description;
      this.multisigners = multisigners.map(({ keyholder, pubKey }) => ({
        keyholder,
        pubKey: PubKey.fromCosmosJSON(pubKey),
      }));
      this.threshold = threshold;
    },
    importFromCosmos(input: string) {
      const aminoPubKey = PubKey.fromStringInput(input).aminoPubKey;
      if (!isMultisigThresholdPubkey(aminoPubKey)) {
        throw new Error('Input public key is not a multisig public key');
      }
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

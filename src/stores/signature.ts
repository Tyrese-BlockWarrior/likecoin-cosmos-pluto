import { defineStore } from "pinia";

import { SingleSignature } from "@/cosmos/signing";
import { encodeBase64 } from "@/utils/utils";

export const useSignatureStore = defineStore('signature', {
  state: () => ({
    signature: null as SingleSignature | null,
  }),
  getters: {
    signatureBase64: (state) => {
      if (!state.signature) {
        return '-';
      }
      return encodeBase64(state.signature.signature);
    },
  },
});

export default useSignatureStore;

import { defineStore } from "pinia";
import * as pako from "pako";

import { encodeBase64URI, decodeBase64 } from '@/utils/utils';

export type Key = 'tx' | 'multisig';

function queryStringsToMap() {
  const output = new Map<Key, string>();
  const { search } = window.location;
  if (!search) {
    return output;
  }
  const pairs = search.substring(1).split('&')
  for (const pair of pairs) {
    const [key, ...values] = pair.split('=');
    const value = decodeURIComponent(values.join('='));
    output.set(decodeURIComponent(key) as Key, value);
  }
  return output;
}

export function encode(key: Key, value: any) {
  const jsonString = JSON.stringify(value);
  const bytes = pako.deflate(jsonString);
  const base64 = encodeBase64URI(bytes);
  return `${encodeURIComponent(key)}=${base64}`;
}

export const useQueryStringStore = defineStore('querystring', {
  state: () => ({
    map: queryStringsToMap(),
  }),
  getters: {
    getKey: (state) => (key: Key) => {
      const base64 = state.map.get(key);
      if (!base64) {
        return null;
      }
      const bytes = decodeBase64(base64);
      const jsonString = pako.inflate(bytes, { to: 'string' });
      const json = JSON.parse(jsonString);
      return json;
    },
  },
  actions: {
    consumeKey(key: Key) {
      const value = this.getKey(key);
      this.map.delete(key);
      return value;
    },
  },
});

import * as Amino from '@cosmjs/amino';

export const typeUrls = {
  secp256k1: '/cosmos.crypto.secp256k1.PubKey',
  ed25519: '/cosmos.crypto.ed25519.PubKey',
  multisigThreshold: '/cosmos.crypto.multisig.LegacyAminoPubKey',
} as const;

export type PubKeyTypeUrl = (typeof typeUrls)[keyof (typeof typeUrls)];
export type PubKeyType = (typeof Amino.pubkeyType)[keyof (typeof Amino.pubkeyType)];

export const pubKeyTypeUrlToType = new Map<string, PubKeyType>([
  [typeUrls.secp256k1, Amino.pubkeyType.secp256k1],
  [typeUrls.ed25519, Amino.pubkeyType.ed25519],
  [typeUrls.multisigThreshold, Amino.pubkeyType.multisigThreshold],
]);

export const pubKeyTypeToTypeUrl = new Map<string, PubKeyTypeUrl>([
  [Amino.pubkeyType.secp256k1, typeUrls.secp256k1],
  [Amino.pubkeyType.ed25519, typeUrls.ed25519],
  [Amino.pubkeyType.multisigThreshold, typeUrls.multisigThreshold],
]);

export function parseJSONInputPubKey(obj: {}) {
  const { ['@type']: inputTypeUrl, key } = obj as { ['@type']: string, key: string };
  if (typeof inputTypeUrl !== 'string' || typeof key !== 'string') {
    throw new Error('Invalid JSON object, missing or invalid "@type" or "key" field');
  }
  if (!pubKeyTypeUrlToType.has(inputTypeUrl)) {
    throw new Error(`Unknown public key type: ${inputTypeUrl}`)
  }
  return {
    type: pubKeyTypeUrlToType.get(inputTypeUrl)!,
    value: key,
  };
}

export function parseStringInputPubKey(input: string) {
  try {
    return Amino.decodeBech32Pubkey(input);
  } catch (err) {
    return {
      type: Amino.pubkeyType.secp256k1,
      value: input,
    };
  }
}

export function parsePubKey(input: string): Amino.Pubkey {
  let obj;
  try {
    obj = JSON.parse(input);
  } catch (err) {
    return parseStringInputPubKey(input);
  }
  if (typeof obj !== 'object') {
    throw new Error('Input public key is JSON but not a JSON object');
  }
  return parseJSONInputPubKey(obj);
}

export function pubKeyToCosmosFormat(pubKey: Amino.Pubkey) {
  return JSON.stringify({
    '@type': pubKeyTypeToTypeUrl.get(pubKey.type as PubKeyType),
    key: pubKey.value,
  });
}

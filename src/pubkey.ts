import {
  Pubkey as AminoPubKey,
  pubkeyType as AminoPubKeyType,
  AccountData,
  decodeBech32Pubkey,
} from '@cosmjs/amino';
import * as Base64 from '@protobufjs/base64';

export const typeUrls = {
  secp256k1: '/cosmos.crypto.secp256k1.PubKey',
  ed25519: '/cosmos.crypto.ed25519.PubKey',
  sr25519: '/cosmos.crypto.sr25519.PubKey',
  multisigThreshold: '/cosmos.crypto.multisig.LegacyAminoPubKey',
} as const;

export type PubKeyTypeUrl = (typeof typeUrls)[keyof (typeof typeUrls)];
export type PubKeyType = (typeof AminoPubKeyType)[keyof (typeof AminoPubKeyType)];

export const pubKeyTypeUrlToType = new Map<string, PubKeyType>([
  [typeUrls.secp256k1, AminoPubKeyType.secp256k1],
  [typeUrls.ed25519, AminoPubKeyType.ed25519],
  [typeUrls.sr25519, AminoPubKeyType.sr25519],
  [typeUrls.multisigThreshold, AminoPubKeyType.multisigThreshold],
]);

export const pubKeyTypeToTypeUrl = new Map<string, PubKeyTypeUrl>([
  [AminoPubKeyType.secp256k1, typeUrls.secp256k1],
  [AminoPubKeyType.ed25519, typeUrls.ed25519],
  [AminoPubKeyType.sr25519, typeUrls.sr25519],
  [AminoPubKeyType.multisigThreshold, typeUrls.multisigThreshold],
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
    return decodeBech32Pubkey(input);
  } catch (err) {
    return {
      type: AminoPubKeyType.secp256k1,
      value: input,
    };
  }
}

export function parsePubKey(input: string): AminoPubKey {
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

export function pubKeyToCosmosFormat(pubKey: AminoPubKey) {
  return JSON.stringify({
    '@type': pubKeyTypeToTypeUrl.get(pubKey.type as PubKeyType),
    key: pubKey.value,
  });
}

export function keplrAccountToAminoPubKey(account: AccountData): AminoPubKey {
  const pubKeyBytes = account.pubkey;
  const pubKeyBase64 = Base64.encode(pubKeyBytes, 0, pubKeyBytes.length);
  const aminoType = AminoPubKeyType[account.algo];
  return {
    type: aminoType,
    value: pubKeyBase64,
  };
}

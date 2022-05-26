import {
  Pubkey as AminoPubKey,
  pubkeyType as AminoPubKeyType,
  AccountData,
  decodeBech32Pubkey,
} from '@cosmjs/amino';
import { encodeBase64, decodeBase64 } from '@/utils/utils';

const typeUrls = {
  secp256k1: '/cosmos.crypto.secp256k1.PubKey',
  ed25519: '/cosmos.crypto.ed25519.PubKey',
  sr25519: '/cosmos.crypto.sr25519.PubKey',
  multisigThreshold: '/cosmos.crypto.multisig.LegacyAminoPubKey',
} as const;

type PubKeyTypeUrl = (typeof typeUrls)[keyof (typeof typeUrls)];
type PubKeyType = (typeof AminoPubKeyType)[keyof (typeof AminoPubKeyType)];

const pubKeyTypeUrlToType = new Map<string, PubKeyType>([
  [typeUrls.secp256k1, AminoPubKeyType.secp256k1],
  [typeUrls.ed25519, AminoPubKeyType.ed25519],
  [typeUrls.sr25519, AminoPubKeyType.sr25519],
  [typeUrls.multisigThreshold, AminoPubKeyType.multisigThreshold],
]);

const pubKeyTypeToTypeUrl = new Map<string, PubKeyTypeUrl>([
  [AminoPubKeyType.secp256k1, typeUrls.secp256k1],
  [AminoPubKeyType.ed25519, typeUrls.ed25519],
  [AminoPubKeyType.sr25519, typeUrls.sr25519],
  [AminoPubKeyType.multisigThreshold, typeUrls.multisigThreshold],
]);

export type CosmosJSONPubKey = {
  ['@type']: string,
  key: string,
};

export class PubKey {
  type: PubKeyType
  value: Uint8Array

  constructor(type: PubKeyType, value: Uint8Array) {
    this.type = type;
    this.value = value;
  }

  toCosmosJSON(): CosmosJSONPubKey {
    return {
      '@type': pubKeyTypeToTypeUrl.get(this.type)!,
      key: encodeBase64(this.value),
    };
  }

  static fromCosmosJSON(json: CosmosJSONPubKey): PubKey {
    const { ['@type']: typeURL, key } = json;
    if (typeof typeURL !== 'string' || typeof key !== 'string') {
      throw new Error('Invalid JSON object, missing or invalid "@type" or "key" field');
    }
    if (!pubKeyTypeUrlToType.has(typeURL)) {
      throw new Error(`Unknown public key type: ${typeURL}`)
    }
    const value = decodeBase64(key);
    return new PubKey(pubKeyTypeUrlToType.get(typeURL)!, value);
  }

  toAminoPubKey(): AminoPubKey {
    return {
      type: this.type,
      value: encodeBase64(this.value),
    };
  }

  static fromAminoPubKey(aminoPubKey: AminoPubKey): PubKey {
    const value = decodeBase64(aminoPubKey.value);
    return new PubKey(aminoPubKey.type as PubKeyType, value);
  }

  static fromBech32(input: string): PubKey {
      const aminoPubKey = decodeBech32Pubkey(input);
      return PubKey.fromAminoPubKey(aminoPubKey);
  }

  static fromStringInput(input: string): PubKey {
    try {
      return PubKey.fromBech32(input);
    } catch {
      const value = decodeBase64(input);
      return new PubKey('tendermint/PubKeySecp256k1', value);
    }
  }

  static fromKeplrAccount(account: AccountData): PubKey {
    const type = AminoPubKeyType[account.algo];
    return new PubKey(type, account.pubkey);
  }
}

import {
  Pubkey as AminoPubKey,
  pubkeyType as AminoPubKeyType,
  AccountData,
  decodeBech32Pubkey,
  SinglePubkey,
  isSinglePubkey,
  MultisigThresholdPubkey,
  isMultisigThresholdPubkey,
} from '@cosmjs/amino';
import { encodeBase64, isBech32 } from '@/utils/utils';
import { test as testBase64 } from '@protobufjs/base64';

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

export class PubKey {
  aminoPubKey: AminoPubKey

  constructor(aminoPubKey: AminoPubKey) {
    this.aminoPubKey = aminoPubKey
  }

  toCosmosJSON(){
    if (isSinglePubkey(this.aminoPubKey)) {
      return {
        '@type': pubKeyTypeToTypeUrl.get(this.aminoPubKey.type)!,
        key: this.aminoPubKey.value,
      };
    }
    if (isMultisigThresholdPubkey(this.aminoPubKey)) {
      const pubKeys: any[] = this.aminoPubKey.value.pubkeys.map((pubKey) => new PubKey(pubKey).toCosmosJSON());
      return {
        '@type': typeUrls.multisigThreshold,
        threshold: Number.parseInt(this.aminoPubKey.value.threshold, 10),
        public_keys: pubKeys,
      };
    }
    throw new Error(`Unknown Amino public key type: ${this.aminoPubKey.type}`);
  }

  static fromCosmosJSON(json: any): PubKey {
    const { ['@type']: typeURL } = json;
    if (typeof typeURL !== 'string') {
      throw new Error('Invalid JSON object: missing or wrong "@type" field');
    }
    const type = pubKeyTypeUrlToType.get(typeURL)!;
    switch (type) {
      case AminoPubKeyType.secp256k1:
      case AminoPubKeyType.ed25519:
      case AminoPubKeyType.sr25519: {
        const { key } = json;
        if (typeof key !== 'string') {
          throw new Error('Invalid JSON object: missing or wrong "key" field');
        }
        return new PubKey({ type, value: key } as SinglePubkey);
      }
      case AminoPubKeyType.multisigThreshold: {
        const { threshold, public_keys: pubKeys } = json;
        if (typeof threshold !== 'number') {
          throw new Error('Invalid JSON object: missing or wrong "threshold" field');
        }
        if (!Array.isArray(pubKeys)) {
          throw new Error('Invalid JSON object: missing or wrong "public_keys" field');
        }
        return new PubKey({
          type,
          value: {
            threshold: threshold.toString(),
            pubkeys: pubKeys.map((pubKey) => PubKey.fromCosmosJSON(pubKey).aminoPubKey),
          },
        } as MultisigThresholdPubkey);
      }
      default: {
        throw new Error(`Unknown public key type URL: ${typeURL}`);
      }
    }
  }

  static fromBech32(input: string): PubKey {
    const aminoPubKey = decodeBech32Pubkey(input);
    return new PubKey(aminoPubKey);
  }

  static fromStringInput(input: string): PubKey {
    const trimmedInput = input.trim();
    if (trimmedInput.startsWith(`'`) && trimmedInput.endsWith(`'`)) {
      // could be a JSON surrounded by "''", e.g. `'{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"..."}'`
      return PubKey.fromStringInput(trimmedInput.slice(1, trimmedInput.length - 1));
    }
    if (trimmedInput.startsWith(`{`) && trimmedInput.endsWith(`}`)) {
      // could be a JSON object, e.g. `{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"..."}`
      const json = JSON.parse(trimmedInput);
      return PubKey.fromCosmosJSON(json);
    }
    // note that isBech32 must go before testBase64, since most Bech32 strings are also valid Base64 strings
    if (isBech32(trimmedInput)) {
      // in theory it is possible to have a Base64 which is also Bech32
      // but in practical use (kind-of-random public key) it should be safe to ignore this case
      return PubKey.fromBech32(trimmedInput);
    }
    if (testBase64(trimmedInput)) {
      // pure Base64 string
      // we don't know the type, treating it as base64 Secp256k1 pubkey
      return new PubKey({ type: AminoPubKeyType.secp256k1, value: trimmedInput });
    }
    throw new Error(`Unknown input string as public key: ${input}`);
  }

  static fromKeplrAccount(account: AccountData): PubKey {
    const type = AminoPubKeyType[account.algo];
    const value = encodeBase64(account.pubkey);
    return new PubKey({ type, value });
  }
}

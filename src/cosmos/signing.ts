import { decodeBase64, encodeBase64 } from '@/utils/utils';
import {
  OfflineAminoSigner,
  StdSignDoc as AminoSignDoc,
  Pubkey as AminoPubKey,
} from '@cosmjs/amino';
import { SignMode, signModeFromJSON, signModeToJSON } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing"

import { PubKey } from './pubkey';


/*
{
  "body": {
    "messages": [
      {
        "@type": "/cosmos.bank.v1beta1.MsgSend",
        "from_address": "cosmos1qnj3svx4ghascwgcpv0m9zkvmam4k9ngw33axw",
        "to_address": "cosmos1gpecs0n34j8v7cvd4752rzfd2mguf430x4eyx0",
        "amount": [{ "denom": "nanolike", "amount": "82000000000" }]
      }
    ],
    "memo": "",
    "timeout_height": "0",
    "extension_options": [],
    "non_critical_extension_options": []
  },
  "auth_info": {
    "signer_infos": [
      {
        "public_key": {
          "@type": "/cosmos.crypto.multisig.LegacyAminoPubKey",
          "threshold": 4,
          "public_keys": [
            {
              "@type": "/cosmos.crypto.secp256k1.PubKey",
              "key": "A97QZurkXD/oB7+bjowhtnDE0uiYebOa40FOEBeJ+vtf"
            },
            {
              "@type": "/cosmos.crypto.secp256k1.PubKey",
              "key": "ArsD6Td03o9Ltvm3fY8MuCIKqZmP/cJ64/mxvPiqsWr8"
            },
            {
              "@type": "/cosmos.crypto.secp256k1.PubKey",
              "key": "AqnkCvrEuhS7oaOloB4seYreEux/Qgyt0HjwYXh6xiXi"
            },
            {
              "@type": "/cosmos.crypto.secp256k1.PubKey",
              "key": "AvAR29Yay7RBWWggfAVwgIn/LYyT2aFdB4NMRCWhb1zr"
            },
            {
              "@type": "/cosmos.crypto.secp256k1.PubKey",
              "key": "A1siiqOxqpHCAILXFKIoFtTK9QuLCKyjdujD0i/30Tpl"
            },
            {
              "@type": "/cosmos.crypto.secp256k1.PubKey",
              "key": "A0cr44YcXoo62i7iNMJVWkwZ59lSw4z9KdileHNcRRBf"
            }
          ]
        },
        "mode_info": {
          "multi": {
            "bitarray": { "extra_bits_stored": 6, "elems": "/A==" },
            "mode_infos": [
              { "single": { "mode": "SIGN_MODE_LEGACY_AMINO_JSON" } },
              { "single": { "mode": "SIGN_MODE_LEGACY_AMINO_JSON" } },
              { "single": { "mode": "SIGN_MODE_LEGACY_AMINO_JSON" } },
              { "single": { "mode": "SIGN_MODE_LEGACY_AMINO_JSON" } },
              { "single": { "mode": "SIGN_MODE_LEGACY_AMINO_JSON" } },
              { "single": { "mode": "SIGN_MODE_LEGACY_AMINO_JSON" } }
            ]
          }
        },
        "sequence": "0"
      }
    ],
    "fee": { "amount": [], "gas_limit": "200000", "payer": "", "granter": "" }
  },
  "signatures": [
    "CkDr+C+4ky8Pym8N061Thu/tcUEXmkX8kGb3KqNsi5zzOWTzEk2/33ADiur/1QVGVCFT6a/hIqJxYVoN9oBOs5uBCkDrQeNIYxTo07hDcTqGG5vKZnJ4n4DybwUsnI7KQPxX7WHBXbEuD+CtEJKO8JyzEWPSqlv6NhG3TuEi6NGW5ppMCkCRQuQyH02thawAygEcRCaDdfBkU1HVpT2Dvidmky8e+GqLiD4sqOIW1i2rtprMAgTeCeuCCvfZve55e7xvubI4CkCVihUJ0H46m+4SvGW5a8AvHoPSPn94h/tHfESJOJP5NUTHIz3oxLjAgE2hSdZVG0YtRz41p4cn42baU2zkNOFUCkCyr88UHtBM/1ovU5H/iZj4Zo75fbJUlTKWHpWTRdf2/DD4si1q/p3kgnXWGa2jLzoJfnAfHKM/jPfwY4EApy2zCkAkhgn4gopszl3cequR8scyMlbNNcCQq7MZzhn45EJ8p0h8VSynpDg3276POKuDwnb7Hh47mK539ixgFV1icwRJ"
  ]
}
*/


/*
{
  "signatures": [
    {
      "public_key": {
        "@type": "/cosmos.crypto.secp256k1.PubKey",
        "key": "A0cr44YcXoo62i7iNMJVWkwZ59lSw4z9KdileHNcRRBf"
      },
      "data": {
        "single": {
          "mode": "SIGN_MODE_LEGACY_AMINO_JSON",
          "signature": "/8CxFprkKmUW8kVbK2P3pte3LKRRYqS8Wnl52trOvM01K4spMcFbE8P1TPLICMGL7lM/1RJtHbd1QHfXumAfpw=="
        }
      },
      "sequence": "7"
    }
  ]
}
*/

export class SingleSignature {
  pubKey: PubKey
  signature: Uint8Array
  sequence: string

  constructor(pubKey: PubKey, signature: Uint8Array, sequence: string) {
    this.pubKey = pubKey;
    this.signature = signature;
    this.sequence = sequence;
  }

  toJSON() {
    return {
      signatures: [{
        public_key: this.pubKey.toCosmosJSON(),
        data: {
          single: {
            mode: signModeToJSON(SignMode.SIGN_MODE_LEGACY_AMINO_JSON),
            signature: encodeBase64(this.signature),
          },
        },
        sequence: this.sequence,
      }],
    };
  }

  static fromJSON(json: SingleSignatureJSON): SingleSignature {
    const sig = json.signatures[0];
    const pubKey = PubKey.fromCosmosJSON(sig.public_key);
    const signature = decodeBase64(sig.data.single.signature);
    const { sequence } = sig;
    return new SingleSignature(pubKey, signature, sequence);
  }
};

type SingleSignatureJSON = ReturnType<InstanceType<typeof SingleSignature>['toJSON']>

export async function signTxAmino(signer: OfflineAminoSigner, signerAddress: string, signDoc: AminoSignDoc): Promise<SingleSignature> {
  const res = await signer.signAmino(signerAddress, signDoc);
  const pubKey = PubKey.fromAminoPubKey(res.signature.pub_key);
  const signature = decodeBase64(res.signature.signature)
  const { sequence } = res.signed;
  return new SingleSignature(pubKey, signature, sequence);
}

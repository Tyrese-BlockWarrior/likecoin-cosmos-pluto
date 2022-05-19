<script setup lang="ts">

import {
  AminoTypes,
  createBankAminoConverters,
  MsgSendEncodeObject,
  StargateClient,
  makeMultisignedTx,
  defaultRegistryTypes,
} from '@cosmjs/stargate';
import { Registry, TxBodyEncodeObject  } from '@cosmjs/proto-signing';
import * as Amino from '@cosmjs/amino';
import * as Base64 from '@protobufjs/base64';

import { parsePubKey } from './pubkey'
import { initKeplr } from './keplr';
import { CHAIN_ID, RPC_ENDPOINT, DENOM, BECH32_PREFIX } from './config';

import { ref } from 'vue';

interface SignatureData {
  address: string
  signature: Amino.StdSignature
  sequence: number
}
const signatures = ref([] as SignatureData[]);
const combinedSignature = ref('');

const aminoConverters = {
  ...createBankAminoConverters(),
};

const aminoTypes = new AminoTypes(aminoConverters);

const registry = new Registry(defaultRegistryTypes);

const pubKeyInputs = [
  '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"A2lYkDJS8FVVFri7alHtiU/Otm9PeG0eJZg1CS0nUQAK"}',
  '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"A/O+qXYcYKMKjsbveDpXP/JoWUTIQgsH/ueoWKRYNHio"}',
  '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"AzP996VjgwdbEOGlZHoPU8Q9U0aRvv+hULtP2Lp258ge"}',
  '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"AryzWG02hPbl7dMO106fiLAzB/q2wsGR86O9jT04mI3r"}',
];
const pubKeys = pubKeyInputs.map(parsePubKey);
const multisigPubKey = Amino.createMultisigThresholdPubkey(pubKeys, 2);

const multisigAddr = Amino.pubkeyToAddress(multisigPubKey, BECH32_PREFIX)
if (multisigAddr !== 'like1fdjelcn6qej98hxjenv0mp54fa674tv096pqah') {
  throw new Error(`Expect like1fdjelcn6qej98hxjenv0mp54fa674tv096pqah, got ${multisigAddr}`);
}

const msg: MsgSendEncodeObject = {
  typeUrl: '/cosmos.bank.v1beta1.MsgSend',
  value: {
    fromAddress: multisigAddr,
    toAddress: 'like1ww3qews2y5jxe8apw2zt8stqqrcu2tpt2w4v7j',
    amount: [{
      amount: '1',
      denom: DENOM,
    }],
  },
};
const aminoMsgSend = aminoTypes.toAmino(msg);

const fee = {
  amount: [], // TODO
  gas: '200000',
};

async function sign() {
  const stargateClient = await StargateClient.connect(RPC_ENDPOINT);
  const acc = await stargateClient.getAccount(multisigAddr)
  if (acc === null) {
    throw new Error(`Cannot query account info for ${multisigAddr}`);
  }
  const { sequence, accountNumber } = acc;

  const signDoc: Amino.StdSignDoc = {
    chain_id: CHAIN_ID,
    account_number: accountNumber.toString(),
    sequence: sequence.toString(),
    msgs: [aminoMsgSend],
    fee,
    memo: '',
  };
  
  const offlineSigner = await initKeplr(CHAIN_ID);
  const currentAddr = (await offlineSigner.getAccounts())[0].address;
  console.log({ currentAddr });
  const signBytes = Amino.serializeSignDoc(signDoc);
  console.log(signBytes);
  console.log([...signBytes].map((x) => String.fromCharCode(x)).join(''));
  
  // const res = await signer.signAmino(accounts[0].address, signDoc);
  const res = await window.keplr!.signAmino(CHAIN_ID, currentAddr, signDoc, {
    disableBalanceCheck: true,
    preferNoSetFee: true,
    preferNoSetMemo: true,
  });
  console.log(res);
  signatures.value.push({
    address: currentAddr,
    signature: res.signature,
    sequence,
  })
}

function combine() {
  const signaturesMap = new Map<string, Uint8Array>();
  for (const { address, signature } of signatures.value) {
    const sigBase64 = signature.signature;
    const buf = new Uint8Array(Base64.length(sigBase64));
    Base64.decode(sigBase64, buf, 0);
    signaturesMap.set(address, buf);
  }
  const txBody: TxBodyEncodeObject = {
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: {
      messages: [msg],
      memo: '',
    },
  };
  const txBodyBytes = registry.encode(txBody);
  const tx = makeMultisignedTx(
    multisigPubKey, signatures.value[0].sequence, fee, txBodyBytes, signaturesMap,
  );
  combinedSignature.value = Base64.encode(tx.signatures[0], 0, tx.signatures[0].length);
}

</script>

<template>
  <div>
    Multisig Address: {{ multisigAddr }}
  </div>
  <div v-for="signature of signatures" v-bind:key="signature.address">
    {{ signature }}
  </div>
  <button @click="sign">Sign using current address</button>
  <button @click="combine">Combine signatures</button>
</template>

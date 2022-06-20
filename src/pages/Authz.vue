<template>
<Signer />
<div>
  Which role is this address?
</div>
<div>
  <select v-model="roleInput">
    <option disabled>Select role</option>
    <option v-for="role of roles">{{ role }}</option>
  </select>
</div>
<div v-if="roleInput === 'Granter'">
  <h2>Run as Granter (Authorizer)</h2>
  <div>
    Grantee address: <input v-model.trim="granteeAddressInput" />
  </div>
  <div>
    <button @click="grantInKeplr">Grant in Keplr</button>
  </div>
</div>
<div v-if="roleInput === 'Grantee'">
  <h2>Run as Grantee (Voter)</h2>
  <div>
    Proposal ID: <input v-model.number="proposalIdInput" />
  </div>
  <div>
    Granter (voter) address: <input v-model.trim="granterAddressInput" />
  </div>
  <div>
    Vote option:
    <select v-model="voteOptionInput">
      <option v-for="(_, voteOption) of voteOptions">{{ voteOption }}</option>
    </select>
  </div>
  <button :disabled="!store.address" @click="vote">Vote</button>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import Long from 'long';
import { EncodeObject } from "@cosmjs/proto-signing";
import { GenericAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { Timestamp } from 'cosmjs-types/google/protobuf/timestamp';

import Signer from '@/components/Signer.vue';

import { useSignerStore } from '@/stores';
import { MsgGrantEncodeObject, MsgExecEncodeObject } from '@/cosmos/msgs';
import { getSigningStargateClient, broadcastTx } from '@/cosmos/client';
import { encodeTx } from '@/cosmos/tx';
import { encodeHex } from '@/utils/utils';

const store = useSignerStore();

const roles = ['Granter', 'Grantee'] as const;

const roleInput = ref(null as typeof roles[number] | null);

const voteOptions = { 
  'Yes': VoteOption.VOTE_OPTION_YES,
  'No': VoteOption.VOTE_OPTION_NO,
  'No with Veto': VoteOption.VOTE_OPTION_NO_WITH_VETO,
  'Abstain': VoteOption.VOTE_OPTION_ABSTAIN,
} as Record<string, VoteOption>;

const granteeAddressInput = ref('');
const granterAddressInput = ref('');
const proposalIdInput = ref(0);
const voteOptionInput = ref('');

function getGrantExpiration(shiftSeconds: number = 60 * 60 * 24 * 365.25 /*one year after*/): Timestamp {
  const seconds = Date.now() / 1000 + shiftSeconds;
  return {
    seconds: new Long(seconds),
    nanos: 0,
  };
}

async function getAddressFromKeplr() {
  await store.getFromBrowserKeplr();
  const { address } = store;
  if (!address) {
    throw new Error('cannot get public key from Keplr');
  }
  return address;
}

async function signAndBroadcast(msg: EncodeObject) {
  const { address } = store;
  const signingStargateClient = await getSigningStargateClient(store.offlineSigner!);
  const fee = {
    amount: [],
    gas: '200000',
  };
  const txRaw = await signingStargateClient.sign(address, [msg], fee, '');
  const { txHash } = encodeTx(txRaw);
  console.log('Computed tx hash: ', encodeHex(txHash));
  const { txID, getResponse } = await broadcastTx(txRaw);
  console.log({txID});
  const res = await getResponse();
  console.log({res});
}

async function grantInKeplr() {
  const address = await getAddressFromKeplr();
  const msg = {
    typeUrl: '/cosmos.authz.v1beta1.MsgGrant',
    value: {
      grant: {
        authorization: {
          typeUrl: '/cosmos.authz.v1beta1.GenericAuthorization',
          value: GenericAuthorization.encode(
            GenericAuthorization.fromPartial({
              msg: '/cosmos.gov.v1beta1.MsgVote',
            }),
          ).finish(),
        },
        expiration: getGrantExpiration(),
      },
      granter: address,
      grantee: granteeAddressInput.value,
    },
  } as MsgGrantEncodeObject;
  await signAndBroadcast(msg);
}

async function vote() {
  const address = await getAddressFromKeplr();
  const msg = {
    typeUrl: '/cosmos.authz.v1beta1.MsgExec',
    value: {
      msgs: [
        {
          typeUrl: '/cosmos.gov.v1beta1.MsgVote',
          value: MsgVote.encode(
            MsgVote.fromPartial({
              proposalId: proposalIdInput.value,
              voter: granterAddressInput.value,
              option: voteOptions[voteOptionInput.value],
            }),
          ).finish(),
        }
      ],
      grantee: address,
    },
  } as MsgExecEncodeObject;
  await signAndBroadcast(msg);
}
</script>

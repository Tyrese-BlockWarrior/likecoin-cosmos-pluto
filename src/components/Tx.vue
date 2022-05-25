<template>
  <div>
    <div>
      <h2>Msg List</h2>
      <ul>
        <li v-for="(msg, i) in txStore.msgs">
          <button @click="txStore.removeMsg(i)">X</button>
          Msg {{i}}: {{msg}}
        </li>
      </ul>
      <button @click="txStore.clearMsgs">Clear all msgs</button>
    </div>
    <div>
      <h2>Select msg to add</h2>
      <div>
        <button v-for="(msgComponent, name) of msgComponents" @click="selectedMsgComponent = msgComponent">
          {{ name }}
        </button>
      </div>
      <div>
        <component :is="selectedMsgComponent" />
      </div>
    </div>
    <div>
      <h2>Fee</h2>
      <div>
        Gas limit: <input v-model.trim.number="inputGasLimit" placeholder="Gas limit"/>
      </div>
      <div>
        Gas price: <input v-model.trim.number="inputGasPrice" placeholder="Gas price"/> {{ DENOM }}
      </div>
      <div>
        Fee: {{ displayedFee }}
      </div>
    </div>
    <div>
      Memo: <input v-model.trim="txStore.memo" placeholder="Memo"/>
    </div>
    <div>
      <h2>Tx</h2>
      <div>
        {{ aminoSignDoc }}
      </div>
      <div>
        <button :disabled="!accountStore.signer" @click="signTx">Sign tx</button>
      </div>
      <div>
        Signature: {{ displayedSignature }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watchEffect } from 'vue';
import * as Base64 from '@protobufjs/base64';
import { StdSignDoc as AminoSignDoc } from '@cosmjs/amino';

import MsgSend from '@/components/msgs/MsgSend.vue';
import MsgDelegate from '@/components/msgs/MsgDelegate.vue';
import MsgUndelegate from '@/components/msgs/MsgUndelegate.vue';
import MsgBeginRedelegate from '@/components/msgs/MsgBeginRedelegate.vue';
import MsgWithdrawDelegationReward from '@/components/msgs/MsgWithdrawDelegationReward.vue';
import MsgFundCommunityPool from '@/components/msgs/MsgFundCommunityPool.vue';

import { useAccountStore } from '@/stores/account';
import { useTxStore } from '@/stores/tx';
import { aminoTypes } from '@/cosmos/tx';
import { DENOM, COIN_NAME, DENOM_EXPONENT, CHAIN_ID } from '@/config';

const accountStore = useAccountStore();
const txStore = useTxStore();

type MsgComponent = typeof MsgSend;

const msgComponents = { 
  MsgSend,
  MsgDelegate,
  MsgUndelegate,
  MsgBeginRedelegate,
  MsgWithdrawDelegationReward,
  MsgFundCommunityPool,
} as const;

const selectedMsgComponent = shallowRef(MsgSend as MsgComponent);
const inputGasLimit = ref(200000);
const inputGasPrice = ref(100);

watchEffect(() => {
  const amount = {
    amount: (inputGasLimit.value * inputGasPrice.value).toFixed(),
    denom: DENOM,
  };
  if (txStore.fee.amount.length === 0) {
    txStore.fee.amount.push(amount);
  } else {
    txStore.fee.amount[0] = amount;
  }
  txStore.fee.gas = inputGasLimit.value;
});

const displayedFee = computed(() => {
  return `${inputGasLimit.value * inputGasPrice.value / Math.pow(10, DENOM_EXPONENT)} ${COIN_NAME}`;
});

const aminoSignDoc = computed(() => getAminoSignDoc());

const signature = ref(new Uint8Array() as Uint8Array);
const displayedSignature = computed(() =>
  Base64.encode(signature.value, 0, signature.value.length)
);

function getAminoSignDoc(): AminoSignDoc {
  return {
    account_number: accountStore.accountNumber.toFixed(),
    sequence: accountStore.sequence.toFixed(),
    chain_id: CHAIN_ID,
    fee: {
      amount: txStore.fee.amount,
      gas: txStore.fee.gas.toFixed(),
    },
    memo: txStore.memo,
    msgs: txStore.msgs.map((msg) => aminoTypes.toAmino(msg)),
  };
}

async function signTx() {
  const res = await accountStore.signer!.signAmino(accountStore.address, aminoSignDoc.value);
  const buf = new Uint8Array(Base64.length(res.signature.signature));
  Base64.decode(res.signature.signature, buf, 0);
  signature.value = buf;
}
</script>

import {
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFreegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
} from '@cosmjs/stargate';
import { EncodeObject } from '@cosmjs/proto-signing';
import { Coin, StdFee } from '@cosmjs/amino';
import { sha256 } from "@cosmjs/crypto";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { camelCaseToSnakeCaseObject, snakeCaseToCamelCaseObject } from '@/utils/utils';
import { BECH32_PREFIX, DENOM, DENOM_EXPONENT } from '@/config';

const aminoConverters = {
  ...createAuthzAminoConverters(),
  ...createBankAminoConverters(),
  ...createDistributionAminoConverters(),
  ...createFreegrantAminoConverters(),
  ...createGovAminoConverters(),
  ...createIbcAminoConverters(),
  ...createStakingAminoConverters(BECH32_PREFIX),
};

export const aminoTypes = new AminoTypes(aminoConverters);

export function humanAmountToDenomAmount(amount: number) {
  return {
    denom: DENOM,
    amount: (amount * Math.pow(10, DENOM_EXPONENT)).toFixed(),
  };
}

export type Fee = {
  amount: number,
  gasLimit: number,
  payer: string,
  granter: string,
};

export function toStdFee(fee: Fee) {
  const { gasLimit, amount } = fee;
  const stdFee = {
    gas: gasLimit.toString(),
    amount: [] as Coin[],
  };
  if (amount > 0) {
    stdFee.amount.push({
      amount: amount.toString(),
      denom: DENOM,
    });
  }
  return stdFee as StdFee;
}

export type UnsignedTxComponents = {
  msgs: EncodeObject[],
  memo: string,
  fee: Fee,
};

export function generateUnsignedTxJSON({ msgs, memo, fee }: UnsignedTxComponents) {
  return {
    body: {
      messages: msgs.map((msg) => ({
        '@type': msg.typeUrl,
        ...camelCaseToSnakeCaseObject(msg.value),
      })),
      memo,
      timeout_height: '0',
      extension_options: [] as any[],
      non_critical_extension_options: [] as any[],
    },
    auth_info: {
      signer_infos: [],
      fee: {
        amount: [{
          denom: DENOM,
          amount: fee.amount.toFixed(),
        }],
        gas_limit: fee.gasLimit.toFixed(),
        payer: fee.payer,
        granter: fee.granter,
      },
    },
    signatures: [],
  };
}

export type UnsignedTxJSON = ReturnType<typeof generateUnsignedTxJSON>;

export function parseUnsignedTxJSON(unsignedTx: UnsignedTxJSON): UnsignedTxComponents {
  const msgs = unsignedTx.body.messages.map((msg) => {
    const { ['@type']: typeUrl, ...value } = msg;
    return { typeUrl, value: snakeCaseToCamelCaseObject(value) };
  });
  const memo = unsignedTx.body.memo;
  const { amount, gas_limit, payer, granter } = unsignedTx.auth_info.fee;
  const feeAmount = amount.length === 0 ? 0 : Number.parseInt(amount[0].amount, 10);
  const gasLimit = Number.parseInt(gas_limit, 10);
  return {
    msgs,
    memo,
    fee: { amount: feeAmount, gasLimit, payer, granter },
  };
}

export function encodeTx(txRaw: TxRaw) {
  const txBytes = TxRaw.encode(txRaw).finish();
  const txHash = sha256(txBytes);
  return { txBytes, txHash };
}

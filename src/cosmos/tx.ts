import * as Amino from '@cosmjs/amino';
import {
  AminoTypes,
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFreegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
  defaultRegistryTypes,
} from '@cosmjs/stargate';
import { EncodeObject, Registry, TxBodyEncodeObject  } from '@cosmjs/proto-signing';
import { BECH32_PREFIX, CHAIN_ID, DENOM, DENOM_EXPONENT } from '@/config';

const aminoConverters = {
  ...createAuthzAminoConverters(),
  ...createBankAminoConverters(),
  ...createDistributionAminoConverters(),
  ...createFreegrantAminoConverters(),
  ...createGovAminoConverters(),
  ...createIbcAminoConverters(),
  ...createStakingAminoConverters(BECH32_PREFIX),
};

const aminoTypes = new AminoTypes(aminoConverters);

const registry = new Registry(defaultRegistryTypes);

export function getAminoSignBytes(accountNumber: number, sequence: number, msgs: EncodeObject[], fee: Amino.StdFee, memo: string) {
  const signDoc: Amino.StdSignDoc = {
    chain_id: CHAIN_ID,
    account_number: accountNumber.toString(),
    sequence: sequence.toString(),
    msgs: msgs.map((msg) => aminoTypes.toAmino(msg)),
    fee,
    memo,
  };
  return Amino.serializeSignDoc(signDoc);
}

export function humanAmountToDenomAmount(amount: number) {
  return {
    denom: DENOM,
    amount: (amount * Math.pow(10, DENOM_EXPONENT)).toFixed(),
  };
}

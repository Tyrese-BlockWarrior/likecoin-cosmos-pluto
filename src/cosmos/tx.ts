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

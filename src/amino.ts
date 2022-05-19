import {
  createAuthzAminoConverters,
  createBankAminoConverters,
  createDistributionAminoConverters,
  createFreegrantAminoConverters,
  createGovAminoConverters,
  createIbcAminoConverters,
  createStakingAminoConverters,
} from '@cosmjs/stargate';

import { BECH32_PREFIX } from './config';

const aminoConverter = {
  ...createAuthzAminoConverters(),
  ...createBankAminoConverters(),
  ...createDistributionAminoConverters(),
  ...createFreegrantAminoConverters(),
  ...createGovAminoConverters(),
  ...createIbcAminoConverters(),
  ...createStakingAminoConverters(BECH32_PREFIX),
};

export function parseMsg({ ['@type']: typeUrl, ...value }: { ['@type']: string }) {
  const converter = aminoConverter[typeUrl];
  if (!converter || converter === 'not_supported_by_chain') {
    throw new Error(`Unknown message: ${typeUrl}`);
  }
  const { aminoType, fromAmino } = converter;
  return {
    type: aminoType,
    value: fromAmino(value),
  };
}

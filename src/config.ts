export const BECH32_PREFIX = 'like';
export const CHAIN_ID = 'likecoin-mainnet-2';
export const RPC_ENDPOINT = 'https://mainnet-node.like.co/rpc/';
export const COIN_NAME = 'LIKE';
export const DENOM = 'nanolike';
export const DENOM_EXPONENT = 9;
export const KEPLR_CHAIN_INFO = {
  "chainId": "likecoin-mainnet-2",
  "chainName": "LikeCoin chain",
  "rpc": "https://mainnet-node.like.co/rpc/",
  "rest": "https://mainnet-node.like.co",
  "stakeCurrency": {
    "coinDenom": "LIKE",
    "coinMinimalDenom": "nanolike",
    "coinDecimals": 9,
    "coinGeckoId": "likecoin"
  },
  "walletUrlForStaking": "https://stake.like.co",
  "bip44": {
    "coinType": 118
  },
  "bech32Config": {
    "bech32PrefixAccAddr": "like",
    "bech32PrefixAccPub": "likepub",
    "bech32PrefixValAddr": "likevaloper",
    "bech32PrefixValPub": "likevaloperpub",
    "bech32PrefixConsAddr": "likevalcons",
    "bech32PrefixConsPub": "likevalconspub"
  },
  "currencies": [
    {
      "coinDenom": "LIKE",
      "coinMinimalDenom": "nanolike",
      "coinDecimals": 9,
      "coinGeckoId": "likecoin"
    }
  ],
  "feeCurrencies": [
    {
      "coinDenom": "LIKE",
      "coinMinimalDenom": "nanolike",
      "coinDecimals": 9,
      "coinGeckoId": "likecoin"
    }
  ],
  "coinType": 118,
  "gasPriceStep": {
    "low": 1,
    "average": 10,
    "high": 1000
  },
  "features": ["ibc-transfer", "ibc-go"]
};

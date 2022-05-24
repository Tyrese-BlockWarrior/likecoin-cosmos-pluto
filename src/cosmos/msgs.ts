import { EncodeObject } from "@cosmjs/proto-signing";
import { MsgBeginRedelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { MsgFundCommunityPool } from "cosmjs-types/cosmos/distribution/v1beta1/tx";

export interface MsgBeginRedelegateEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate";
    readonly value: Partial<MsgBeginRedelegate>;
}
export function isMsgBeginRedelegateEncodeObject(object: EncodeObject): object is MsgBeginRedelegateEncodeObject {
  return object.typeUrl === "/cosmos.staking.v1beta1.MsgBeginRedelegate";
}

export interface MsgFundCommunityPoolEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.distribution.v1beta1.MsgFundCommunityPool";
    readonly value: Partial<MsgFundCommunityPool>;
}
export function isMsgFundCommunityPoolEncodeObject(object: EncodeObject): object is MsgFundCommunityPoolEncodeObject {
  return object.typeUrl === "/cosmos.distribution.v1beta1.MsgFundCommunityPool";
}

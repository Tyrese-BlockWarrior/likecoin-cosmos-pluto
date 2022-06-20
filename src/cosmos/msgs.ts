import { EncodeObject } from "@cosmjs/proto-signing";
import { MsgBeginRedelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { MsgFundCommunityPool } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import { MsgExec, MsgGrant, MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx"

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

export interface MsgGrantEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.authz.v1beta1.MsgGrant";
    readonly value: Partial<MsgGrant>;
}
export function isMsgGrantEncodeObject(object: EncodeObject): object is MsgGrantEncodeObject {
  return object.typeUrl === "/cosmos.authz.v1beta1.MsgGrant";
}

export interface MsgExecEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.authz.v1beta1.MsgExec";
    readonly value: Partial<MsgExec>;
}
export function isMsgExecEncodeObject(object: EncodeObject): object is MsgExecEncodeObject {
  return object.typeUrl === "/cosmos.authz.v1beta1.MsgExec";
}

export interface MsgRevokeEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.authz.v1beta1.MsgRevoke";
    readonly value: Partial<MsgRevoke>;
}
export function isMsgRevokeEncodeObject(object: EncodeObject): object is MsgRevokeEncodeObject {
  return object.typeUrl === "/cosmos.authz.v1beta1.MsgRevoke";
}

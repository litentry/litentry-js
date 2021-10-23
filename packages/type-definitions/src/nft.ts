import { RegistryTypes } from "@polkadot/types/types";

const types: RegistryTypes = {
  Address: "MultiAddress",
  BN: "BlockNumber",
  CID: "Vec<u8>",
  ClassId: "u32",
  ClassData: {
    properties: "Properties",
    start_block: "Option<BN>",
    end_block: "Option<BN>",
    class_type: "ClassType<ID>",
  },
  ClassInfoOf: {
    metadata: "CID",
    totalIssuance: "TokenId",
    owner: "AccountId",
    data: "ClassData",
  },
  ClassIdOf: "ClassId",
  ClassType: {
    _enum: {
      Simple: "u32",
      Claim: "HashByte32",
      Merge: "(ClassIdOf, ClassIdOf, bool)",
    },
  },
  DataSource: "u64",
  EthAddress: "[u8; 20]",
  HashByte32: "[u8; 32]",
  LookupSource: "MultiAddress",
  Properties: { _enum: ["None", "Transferable", "Burnable", "Both"] },
  TokenData: { used: "bool", rarity: "u8" },
  TokenId: "u64",
  TokenIdOf: "TokenId",
  TokenInfoOf: {
    metadata: "CID",
    owner: "AccountId",
    data: "TokenData",
  },
  QueryKey: "u64",
};

// we may need more in here e.g. rpc, that's why it's not "export default types"
export default {
  types,
};

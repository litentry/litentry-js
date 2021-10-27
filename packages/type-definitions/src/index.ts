import nft from './nft';

// we will be exporting multiple pallets here eventually
export default {
  rpc: {},
  types: {
    ...nft.types,
  },
};

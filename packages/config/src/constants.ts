import { Address, Chain } from "viem";
import { mainnet, sepolia } from "viem/chains";

export const whitelistedHyperdriveMarkets: Address[] = [
  "0xb4E605E079B4D9ed50B7202Ca0d008EE473A8de4",
];

export const supportedChainIds: Chain["id"][] = [
  mainnet.id,
  sepolia.id,
] as const;

export type SupportedChainId = 1 | 11155111;

export const morphoAddressesByChain: Record<
  SupportedChainId,
  {
    blue: Address;
    irm: Address;
  }
> = {
  [mainnet.id]: {
    blue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
  },
  [sepolia.id]: {
    blue: "0x927A9E3C4B897eF5135e6B2C7689637fA8E2E0Bd",
    irm: "0x0fB591F09ab2eB967c0EFB9eE0EF6642c2abe6Ab",
  },
};

export const whitelistedMetaMorphoMarketsByChain: Record<
  SupportedChainId,
  { morphoId: string; hyperdrive: Address }[]
> = {
  [mainnet.id]: [],
  [sepolia.id]: [
    {
      morphoId:
        "0x25265c1600f7ba171c1037d6a3b431516e817efa9b580d8089cdb51ba719da96",
      hyperdrive: "0xE352F4D16C7Ee4162d1aa54b77A15d4DA8f35f4b",
    },
  ],
};

export const tokenIconBySymbol: Record<string, string> = {
  DAI: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=032",
  SDAI: "https://1827921443-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FjvdfbhgN5UCpMtP1l8r5%2Fuploads%2Fgit-blob-9873db4416f6c6f7f29d9be3ead28f5317f3dfa3%2FBadge_Dai%202.svg?alt=media",
};

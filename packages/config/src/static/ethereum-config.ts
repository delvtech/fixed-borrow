// This file is auto-generated. Do not edit manually.
export const config = {
  tokens: [
    {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      symbol: "DAI",
      name: "Dai Stablecoin",
      decimals: 18,
      iconUrl:
        "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=032",
    },
    {
      address: "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3",
      symbol: "USDe",
      name: "USDe",
      decimals: 18,
      iconUrl: "https://cdn.morpho.org/assets/logos/susde.svg",
    },
    {
      address: "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497",
      symbol: "sUSDe",
      name: "Staked USDe",
      decimals: 18,
      iconUrl: "https://cdn.morpho.org/assets/logos/usde.svg",
    },
  ],
  morphoMarkets: [
    {
      id: "0x39d11026eae1c6ec02aa4c0910778664089cdd97c3fd23f68f7cd05e2e95af48",
      hyperdrive: "0xd41225855A5c5Ba1C672CcF4d72D1822a5686d30",
      loanToken: {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        name: "Dai Stablecoin",
        decimals: 18,
        iconUrl:
          "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=032",
      },
      collateralToken: {
        address: "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497",
        symbol: "sUSDe",
        name: "Staked USDe",
        decimals: 18,
        iconUrl: "https://cdn.morpho.org/assets/logos/usde.svg",
      },
      oracle: "0x5D916980D5Ae1737a8330Bf24dF812b2911Aae25",
      irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
      lltv: "860000000000000000",
      duration: "15724800",
    },
    {
      id: "0xc581c5f70bd1afa283eed57d1418c6432cbff1d862f94eaf58fdd4e46afbb67f",
      hyperdrive: "0xA29A771683b4857bBd16e1e4f27D5B6bfF53209B",
      loanToken: {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        name: "Dai Stablecoin",
        decimals: 18,
        iconUrl:
          "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=032",
      },
      collateralToken: {
        address: "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3",
        symbol: "USDe",
        name: "USDe",
        decimals: 18,
        iconUrl: "https://cdn.morpho.org/assets/logos/susde.svg",
      },
      oracle: "0xaE4750d0813B5E37A51f7629beedd72AF1f9cA35",
      irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
      lltv: "860000000000000000",
      duration: "15724800",
    },
  ],
} as const

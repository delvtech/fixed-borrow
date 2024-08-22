import sepoliaConfigJson from "./sepolia-config.json";
import mainnetConfigJson from "./ethereum-config.json";

export type Config = {
  tokens: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    iconUrl: string;
  }[];
  morphoMarkets: {
    id: string;
    hyperdrive: string;
    duration: string;
    loanToken: {
      address: string;
      symbol: string;
      name: string;
      decimals: number;
      iconUrl: string;
    };
    collateralToken: {
      address: `0x${string}`;
      symbol: string;
      name: string;
      decimals: number;
      iconUrl: string;
    };
    oracle: `0x${string}`;
    irm: `0x${string}`;
    lltv: string;
  }[];
};

const sepoliaConfig = sepoliaConfigJson as Config;
const mainnetConfig = mainnetConfigJson as Config;

export { sepoliaConfig, mainnetConfig };

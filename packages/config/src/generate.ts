import { ReadHyperdrive } from "@delvtech/hyperdrive-viem";
import * as fs from "fs";
import { Address, createPublicClient, http } from "viem";
import { mainnet, sepolia } from "viem/chains";
import {
  SupportedChainId,
  morphoAddressesByChain,
  supportedChainIds,
  tokenIconBySymbol,
  whitelistedMetaMorphoMarketsByChain,
} from "./constants";
import { MorphoBlueAbi } from "@hyperdrive-borrow/artifacts/morpho/MorphoBlueAbi";
import { ERC20Abi } from "@hyperdrive-borrow/artifacts/base/ERC20";

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: Address;
  iconUrl?: string;
}

const mainnetPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const sepoliaPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

function getClient(chainId: number) {
  if (chainId === 1) {
    return mainnetPublicClient;
  }
  return sepoliaPublicClient;
}

supportedChainIds.forEach(async (chainId) => {
  const client = getClient(chainId);
  const morphoMarketIds =
    whitelistedMetaMorphoMarketsByChain[chainId as SupportedChainId];
  const morphoBlueAddress =
    morphoAddressesByChain[chainId as SupportedChainId].blue;

  const tokens: Array<Token> = [];

  // loanToken address, collateralToken address, oracle address, irm address, lltv uint256
  const morphoMarkets = await Promise.all(
    morphoMarketIds.map(async (market) => {
      const [loanTokenAddress, collateralTokenAddress, oracle, irm, lltv] =
        await client.readContract({
          abi: MorphoBlueAbi,
          address: morphoBlueAddress,
          functionName: "idToMarketParams",
          args: [market.morphoId as Address],
        });

      const loanTokenSymbol = await client.readContract({
        abi: ERC20Abi,
        address: loanTokenAddress,
        functionName: "symbol",
      });
      const loanTokenName = await client.readContract({
        abi: ERC20Abi,
        address: loanTokenAddress,
        functionName: "name",
      });
      const loanTokenDecimals = await client.readContract({
        abi: ERC20Abi,
        address: loanTokenAddress,
        functionName: "decimals",
      });

      const collateralTokenSymbol = await client.readContract({
        abi: ERC20Abi,
        address: collateralTokenAddress,
        functionName: "symbol",
      });
      const collateralTokenName = await client.readContract({
        abi: ERC20Abi,
        address: collateralTokenAddress,
        functionName: "name",
      });
      const collateralTokenDecimals = await client.readContract({
        abi: ERC20Abi,
        address: collateralTokenAddress,
        functionName: "decimals",
      });

      const loanToken = {
        address: loanTokenAddress,
        symbol: loanTokenSymbol,
        name: loanTokenName,
        decimals: loanTokenDecimals,
        iconUrl: tokenIconBySymbol[loanTokenSymbol],
      };

      const collateralToken = {
        address: collateralTokenAddress,
        symbol: collateralTokenSymbol,
        name: collateralTokenName,
        decimals: collateralTokenDecimals,
        iconUrl: tokenIconBySymbol[collateralTokenSymbol],
      };

      !tokens.some((token) => token.address === loanTokenAddress) &&
        tokens.push(loanToken);
      !tokens.some((token) => token.address === collateralTokenAddress) &&
        tokens.push(collateralToken);

      const readHyperdrive = new ReadHyperdrive({
        publicClient: client,
        address: market.hyperdrive,
      });

      const termLength = (await readHyperdrive.getPoolConfig())
        .positionDuration;

      return {
        id: market.morphoId,
        hyperdrive: market.hyperdrive,
        loanToken,
        collateralToken,
        oracle,
        irm,
        lltv: lltv.toString(),
        termLength: termLength.toString(),
      };
    })
  );

  fs.writeFileSync(
    `src/static/${client.chain.name.toLowerCase()}-config.json`,
    JSON.stringify({
      tokens,
      morphoMarkets,
    })
  );
});

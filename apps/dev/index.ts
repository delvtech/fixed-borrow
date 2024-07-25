import { ReadHyperdrive } from "@delvtech/hyperdrive-viem";
import { createPublicClient, http, PublicClient } from "viem";

const publicClient = createPublicClient({
  transport: http(
    "https://eth-sepolia.g.alchemy.com/v2/1lwuV3-H1ieTJ_tXRFJz2s5cXpmtJTvD"
  ),
});

const read = new ReadHyperdrive({
  address: "0xE352F4D16C7Ee4162d1aa54b77A15d4DA8f35f4b",
  publicClient: publicClient as any,
});

console.log(await read.getFixedApr());

import { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  schema: "https://blue-api.morpho.org/graphql",
  documents: ["lib/**/*.ts", "lib/**/*.gql"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./lib/morpho/gql/": {
      preset: "client",
      config: {
        scalars: {
          BigInt: {
            input: "string",
            output: "string",
          },
        },
      },
    },
  },
}

export default config

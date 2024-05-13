import { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  schema: "https://blue-api.morpho.org/graphql",
  documents: ["lib/**/*.ts", "lib/**/*.gql"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./lib/morpho/gql/": {
      preset: "client",
      presetConfig: {
        // https://github.com/dotansimha/graphql-code-generator/discussions/9271
        fragmentMasking: false,
      },
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

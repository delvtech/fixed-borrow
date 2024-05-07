import { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  schema: "https://blue-api.morpho.org/graphql",
  documents: ["./lib/**/*.ts"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./lib/morpho/gql/": {
      preset: "client",
    },
  },
}

export default config

import { Navbar } from "components/Navigation"
import { HomePage } from "pages/HomePage"
import { Route, Switch } from "wouter"

import "@rainbow-me/rainbowkit/styles.css"

import {
  RainbowKitProvider,
  getDefaultConfig,
  midnightTheme,
} from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"

const queryClient = new QueryClient()

const rainbowConfig = getDefaultConfig({
  appName: "Hyperdrive Borrow",
  projectId: import.meta.env.VITE_WALLET_CONNECT_ID,
  chains: [mainnet, sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
})

function App() {
  return (
    <WagmiProvider config={rainbowConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={midnightTheme()}>
          <div className="h-screen">
            <Navbar />
            <Switch>
              <Route path="/" component={HomePage} />

              {/* Default route in a switch */}
              <Route>404: No such page!</Route>
            </Switch>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App

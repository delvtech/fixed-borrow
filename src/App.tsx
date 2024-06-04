import { Navbar } from "components/Navigation"
import { HomePage } from "pages/HomePage"
import { Route, Switch } from "wouter"

import "@rainbow-me/rainbowkit/styles.css"

import { RainbowKitProvider, midnightTheme } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { rainbowConfig } from "./client/rainbowClient"

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={rainbowConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={midnightTheme()}>
          <div className="min-h-screen">
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

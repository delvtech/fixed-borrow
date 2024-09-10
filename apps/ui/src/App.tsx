import { Navbar } from "components/core/Navigation"
import { HomePage } from "pages/HomePage"
import { Route, Switch } from "wouter"

import "@rainbow-me/rainbowkit/styles.css"

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import AppFooter from "components/core/AppFooter"
import { BorrowPage } from "pages/BorrowPage"
import DevPage from "pages/DevPage"
import { PositionPage } from "pages/PositionPage"
import { WagmiProvider } from "wagmi"
import { rainbowConfig } from "./client/rainbowClient"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function App() {
  return (
    <WagmiProvider config={rainbowConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            borderRadius: "large",
            fontStack: "system",
          })}
        >
          <div className="min-h-screen bg-gradient-to-b from-[#0F1117] to-[#05060B]">
            <Navbar />
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/dev" component={DevPage} />
              <Route path="/borrow/:hyperdrive" component={BorrowPage} />
              <Route path="/positions" component={PositionPage} />

              {/* Default route in a switch */}
              <Route>404: No such page!</Route>
            </Switch>

            <AppFooter />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App

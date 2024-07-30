import { Navbar } from "components/core/Navigation"
import { HomePage } from "pages/HomePage"
import { Route, Switch } from "wouter"

import "@rainbow-me/rainbowkit/styles.css"

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BorrowPage } from "pages/BorrowPage"
import DevPage from "pages/DevPage"
import { PositionPage } from "pages/PositionPage"
import { WagmiProvider } from "wagmi"
import { rainbowConfig } from "./client/rainbowClient"

const queryClient = new QueryClient()

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
          <div className="min-h-screen">
            <Navbar />
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/dev" component={DevPage} />
              <Route path="/borrow/:hyperdrive" component={BorrowPage} />
              <Route path="/position/:hyperdrive" component={PositionPage} />

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

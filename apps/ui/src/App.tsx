import { Navbar } from "components/core/Navigation"
import { HomePage } from "pages/HomePage"
import { Route, Switch, useLocation } from "wouter"

import "@rainbow-me/rainbowkit/styles.css"

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import AppFooter from "components/core/AppFooter"
import { BorrowPage } from "pages/BorrowPage"
import DevPage from "pages/DevPage"
import { PositionPage } from "pages/PositionPage"
import { PropsWithChildren, useEffect } from "react"
import { WagmiProvider } from "wagmi"
import { rainbowConfig } from "./client/rainbowClient"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function Container(props: PropsWithChildren) {
  // Scroll to top for every location change.
  const [location] = useLocation()
  useEffect(() => {
    scrollTo(0, 0)
  }, [location])

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-[#05060d] to-[#0c141e]">
      {props.children}
    </div>
  )
}

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
          <Container>
            <Navbar />
            <div className="grow">
              <Switch>
                <Route path="/" component={HomePage} />
                <Route path="/dev" component={DevPage} />
                <Route path="/borrow/:hyperdrive" component={BorrowPage} />
                <Route path="/positions" component={PositionPage} />

                {/* Default route in a switch */}
                <Route>404: No such page!</Route>
              </Switch>
            </div>

            <AppFooter />
          </Container>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App

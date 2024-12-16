import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TermsOfServiceDialog } from "components/compliance/TermsOfServiceDialog"
import AppFooter from "components/core/AppFooter"
import { Navbar } from "components/core/Navigation"
import { useAddressScreen } from "hooks/compliance/useAddressScreen"
import { RegionInfoProvider } from "hooks/compliance/useRegionInfo"
import { useVpnScreen } from "hooks/compliance/useVpnScreen"
import { BorrowPage } from "pages/BorrowPage"
import DevPage from "pages/DevPage"
import { HomePage } from "pages/HomePage"
import { OTCPage } from "pages/OTCPage"
import { RestrictedCountriesPage } from "pages/RestrictedCountriesPage"
import { VpnNotAllowedPage } from "pages/VpnNotAllowedPage"
import { PropsWithChildren, useEffect } from "react"
import { WagmiProvider } from "wagmi"
import { Route, Switch, useLocation } from "wouter"
import { Plausible } from "./analytics/Plausible"
import { rainbowConfig } from "./client/rainbowClient"
import { FillOrder } from "./otc/flow/FillOrder"
import { NewOrder } from "./otc/flow/NewOrder"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function Container(props: PropsWithChildren) {
  useVpnScreen()
  useAddressScreen()

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
          <RegionInfoProvider>
            <Container>
              <Navbar />
              <div className="grow">
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route path="/dev" component={DevPage} />
                  <Route path="/borrow/:hyperdrive" component={BorrowPage} />
                  <Route
                    path="/restricted_countries"
                    component={RestrictedCountriesPage}
                  />
                  <Route path="/vpn" component={VpnNotAllowedPage} />
                  <Route path="/otc" component={OTCPage} />
                  <Route path="/otc/new" component={NewOrder} />
                  <Route path="/otc/fill/:orderKey" component={FillOrder} />
                  {/* Default route in a switch */}
                  <Route>404: No such page!</Route>
                </Switch>
              </div>

              <TermsOfServiceDialog />
              <Plausible />
              <AppFooter />
            </Container>
          </RegionInfoProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App

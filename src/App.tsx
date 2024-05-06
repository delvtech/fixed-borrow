import { HomePage } from "pages/HomePage"
import { Route, Switch } from "wouter"

function App() {
  return (
    <div className="h-screen">
      <Switch>
        <Route path="/" component={HomePage} />

        {/* Default route in a switch */}
        <Route>404: No such page!</Route>
      </Switch>
    </div>
  )
}

export default App

import { initSync, wasmBuffer } from "@delvtech/fixed-point-wasm"
import React from "react"
import ReactDOM from "react-dom/client"
import "./globals.css"

/**
 * Note: Dynamically importing `App` after initiating fixed-point-wasm ensures
 * that the wasm is ready in the global scope of all UI code. Without this, the
 * lib could only be used inside function scopes since the global scope of
 * imported code is evaluated before `initSync` is called.
 *
 * The impact on the App's initial render should be negligible.
 */
initSync(wasmBuffer)
const { default: App } = await import("./App")

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

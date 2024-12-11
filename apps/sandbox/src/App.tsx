import { useQuery } from "@tanstack/react-query"
import { OtcClient } from "otc-api"

const otcApiUrl = import.meta.env.VITE_OTC_API_URL

function App() {
  const { status, data, error } = useQuery({
    queryKey: ["test"],
    queryFn: () => {
      const client = new OtcClient(otcApiUrl)
      return client.getOrders()
    },
  })

  console.log({ status, data, error })

  return (
    <div className="mx-auto max-w-lg">
      <h1>Sandbox</h1>
      <div className="flex flex-col gap-4">
        <div>
          <h2>Status</h2>
          <code>{status}</code>
        </div>

        <div>
          <h2>Data</h2>
          <textarea
            readOnly
            className="h-[500px] w-full rounded-lg bg-slate-800 p-6 font-mono text-white"
            value={JSON.stringify(
              data,
              (_, v) => (typeof v === "bigint" ? String(v) : v),
              2
            )}
          />
        </div>

        <div>
          <h2>Error</h2>
          <textarea
            readOnly
            className="h-[500px] w-full rounded-lg bg-slate-800 p-6 font-mono text-white"
            value={JSON.stringify(
              error,
              (_, v) => (typeof v === "bigint" ? String(v) : v),
              2
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default App

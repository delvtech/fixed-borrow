import { useQuery } from "@tanstack/react-query"
import type { QueryParams } from "otc-api"

const otcApiUrl = import.meta.env.VITE_OTC_API_URL

function App() {
  const params: QueryParams = {
    trader: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  }

  const { status, data, error } = useQuery({
    queryKey: ["test"],
    queryFn: () => {
      const url = new URL(otcApiUrl)
      url.search = new URLSearchParams(params).toString()
      return fetch(url, {
        method: "GET",
      }).then((res) => res.json())
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
            value={JSON.stringify(data, null, 2)}
          />
        </div>

        <div>
          <h2>Error</h2>
          <textarea
            readOnly
            className="h-[500px] w-full rounded-lg bg-slate-800 p-6 font-mono text-white"
            value={JSON.stringify(error, null, 2)}
          />
        </div>
      </div>
    </div>
  )
}

export default App

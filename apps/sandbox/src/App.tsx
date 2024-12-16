import { useQuery } from "@tanstack/react-query"
import { OtcClient } from "otc-api"

const otcApiUrl = import.meta.env.VITE_OTC_API_URL
const client = new OtcClient(otcApiUrl)

function App() {
  const {
    data,
    dataUpdatedAt,
    error,
    fetchStatus,
    isFetched,
    status,
    refetch,
  } = useQuery({
    queryKey: ["test"],
    enabled: false,
    queryFn: () => {
      return client.getOrders()
    },
  })

  console.log({ status, data, error })

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1>Sandbox</h1>

      <p>
        <strong>Status: </strong>
        <code
          className={
            status === "success"
              ? "text-green-500"
              : status === "error"
                ? "text-red-500"
                : "text-slate-300"
          }
        >
          {status} ({fetchStatus})
        </code>
      </p>

      <p>
        <strong>Last fetch: </strong>
        <code className="text-slate-300">
          {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString() : "-"}
        </code>
      </p>

      <button
        className="h-10 rounded-lg border bg-teal-400 px-4 font-bold text-slate-800"
        onClick={() => refetch()}
      >
        {isFetched ? "Refetch" : "Fetch"}
      </button>

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
  )
}

export default App

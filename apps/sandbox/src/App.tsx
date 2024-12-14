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
      const key1 =
        "pending/0x16C0a9C9967d8e860bf84596769ef513dd6f2094:0xd41225855A5c5Ba1C672CcF4d72D1822a5686d30:0:0xef74f02eb1f5cd69f3a223b5a994bbad0cf5c347e973005b61b4317972c4df25.json"
      const key2 =
        "pending/0x16C0a9C9967d8e860bf84596769ef513dd6f2094:0xd41225855A5c5Ba1C672CcF4d72D1822a5686d30:1:0xa51245cbd6fb0529a936c76cae9cb3ba687959f4a6adab46fcab3ab85ef98876.json"
      const orders = Promise.all([client.getOrder(key1), client.getOrder(key2)])
      return client.updateOrder({
        key: key1,
        signature: "0x0",
      })
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

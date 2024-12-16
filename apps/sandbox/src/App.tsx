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
      // return client.getOrders()
      return client.createOrder({
        trader: "0x16C0a9C9967d8e860bf84596769ef513dd6f2094",
        hyperdrive: "0xd41225855A5c5Ba1C672CcF4d72D1822a5686d30",
        amount: 338970000000000000000n,
        slippageGuard: 311852400000000000000n,
        minVaultSharePrice: 1087869905097n,
        options: {
          asBase: true,
          destination: "0x16C0a9C9967d8e860bf84596769ef513dd6f2094",
          extraData: "0x",
        },
        orderType: 0,
        expiry: 1734448583,
        salt: "0x04e883067af7030208288eca18595b1897fc9bab88fd140f17557a8882e8b414",
        // signature:
        //   "0x014aa777745cca100a39b79897fca8ad6fa5c88efd23686c649a05cf1a91fea82c3334ea2b7a561704fd9fcde121f7d69e8444b895e515eec3276fee4a9a20a31c",
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

import { fixed } from "@delvtech/fixed-point-wasm"
import {
  CellContext,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Skeleton } from "components/base/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/base/table"
import { TokenPair } from "components/tokens/TokenPair"
import { useAllMarkets } from "hooks/markets/useAllMarkets"
import { ChevronsUpDown, ExternalLink } from "lucide-react"
import { useState } from "react"
import { sepolia } from "viem/chains"
import { useChainId, usePublicClient } from "wagmi"
import { MarketInfo } from "../../types"

export function AllMarketsTable() {
  const { data = [], isLoading } = useAllMarkets()

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="rounded-md border bg-secondary">
      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-secondary">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-normal text-secondary-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="border-b-0 hover:bg-secondary"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

const columns: ColumnDef<MarketInfo>[] = [
  {
    header: "Collateral/Debt",
    accessorFn: (row) => {
      return `${row.market.collateralToken.symbol}/${row.market.loanToken.symbol}`
    },
    cell: (props: CellContext<MarketInfo, string>) => {
      const { row, getValue } = props

      const lltv = fixed(row.original.market.lltv).format({
        percent: true,
        decimals: 1,
        trailingZeros: false,
      })

      return (
        <div className="flex items-center gap-x-2 font-mono">
          <TokenPair market={row.original.market} />
          {getValue()}

          <Badge variant="secondary" className="border-none px-1 text-xs">
            LLTV: {lltv}
          </Badge>
        </div>
      )
    },
  },
  {
    id: "Liquidity",
    accessorKey: "liquidity",
    header: () => <div className="text-right">Liquidity</div>,
    cell: (props: CellContext<MarketInfo, bigint>) => {
      const { getValue } = props
      const liquidity = fixed(getValue())

      return (
        <p className="text-right font-mono">
          {liquidity.format({
            compactDisplay: "short",
          })}{" "}
          {props.row.original.market.loanToken.symbol}
        </p>
      )
    },
  },
  {
    id: "Variable",
    accessorKey: "borrowRate",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      return Number(rowA.original.borrowRate - rowB.original.borrowRate)
    },
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="rounded"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <div className="text-right">Variable</div>
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (props: CellContext<MarketInfo, bigint>) => {
      const { getValue } = props
      const borrowRate = fixed(getValue()).format({
        decimals: 2,
        trailingZeros: false,
        percent: true,
      })

      return <div className="text-center font-mono">{borrowRate}</div>
    },
  },
  {
    id: "Fixed",
    accessorKey: "fixedRate",
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      return Number(rowA.original.fixedRate - rowB.original.fixedRate)
    },
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="rounded"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <div>Fixed</div>
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (props: CellContext<MarketInfo, bigint>) => {
      const { getValue } = props

      const formattedValue = fixed(getValue()).format({
        percent: true,
        trailingZeros: false,
        decimals: 2,
      })

      return (
        <div className="text-center">
          <span className="gradient-text font-mono font-medium">
            {formattedValue}
          </span>
        </div>
      )
    },
  },
  {
    id: "App Link",
    header: () => <div></div>,
    cell: (props: CellContext<MarketInfo, bigint>) => {
      const client = usePublicClient()
      const chainId = useChainId()

      // TODO will need to generalize when multi-protocol
      const morphoUrl = new URL("market", "https://app.morpho.org")
      morphoUrl.searchParams.set("id", props.row.original.market.metadata.id)
      if (client) {
        morphoUrl.searchParams.set("network", client?.chain.name.toLowerCase())
      }

      const isTestnet = chainId && chainId === sepolia.id

      return (
        <div>
          <a
            href={isTestnet ? "#" : morphoUrl.toString()}
            className="block w-min"
            target="_blank"
            aria-label={`Go to ${props.row.original.market.collateralToken.symbol}/${props.row.original.market.loanToken.symbol} on Morpho`}
            rel="noopener noreferrer"
          >
            <div className="flex w-min items-center rounded-full bg-accent p-4 text-foreground/60 hover:bg-accent/60">
              <ExternalLink size={16} />
            </div>
          </a>
        </div>
      )
    },
  },
]

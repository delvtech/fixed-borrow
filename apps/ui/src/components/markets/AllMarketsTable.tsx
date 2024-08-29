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
import * as React from "react"

import { fixed } from "@delvtech/fixed-point-wasm"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/base/table"
import { useAllMarkets } from "hooks/markets/useAllMarkets"
import { ArrowRight, ChevronsUpDown } from "lucide-react"
import { formatRate } from "utils/base/formatRate"
import { sepolia } from "viem/chains"
import { useChainId, usePublicClient } from "wagmi"
import { Market, MarketInfo } from "../../types"

export function AllMarketsTable() {
  const { data = [] } = useAllMarkets()

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

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
    <div className="w-full max-w-screen-xl">
      <div className="flex items-center py-4"></div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-background">
                {headerGroup.headers.map((header) => {
                  return (
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
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
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
      </div>
    </div>
  )
}

interface TokenPairProps {
  market: Market
  size?: number
}
function TokenPair(props: TokenPairProps) {
  return (
    <div className="flex">
      <img src={props.market.collateralToken.iconUrl} className="size-5" />
      <img src={props.market.loanToken.iconUrl} className="-ml-3 size-5" />
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

    header: () => <div className="text-right">Liquidity</div>,
    accessorFn: (row) => {
      return row.liquidity
    },
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
    id: "Borrow Rate",
    accessorFn: (row) => {
      return row.borrowRate
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      return Number(rowA.original.borrowRate - rowB.original.borrowRate)
    },
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="rounded-none"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <div className="text-right">Borrow Rate</div>
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (props: CellContext<MarketInfo, bigint>) => {
      const { getValue } = props
      const borrowRate = fixed(getValue()).format({
        decimals: 2,
        percent: true,
      })

      return <div className="text-right font-mono lowercase">{borrowRate}</div>
    },
  },
  {
    id: "Fixed Borrow Rate",
    accessorFn: (row) => {
      return row.fixedRate
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      return Number(rowA.original.fixedRate - rowB.original.fixedRate)
    },
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="justify-end rounded-none p-0"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <div className="text-right">Fixed Borrow Rate</div>
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (props: CellContext<MarketInfo, bigint>) => {
      const { getValue } = props

      return (
        <div className="text-right">
          <span className="gradient-text font-mono font-medium">
            {formatRate(getValue())}
          </span>
        </div>
      )
    },
  },
  {
    id: "App Link",
    accessorFn: (row) => {
      return row.market
    },
    header: () => <div></div>,
    cell: (props: CellContext<MarketInfo, bigint>) => {
      const client = usePublicClient()
      const chainId = useChainId()
      // TODO will need to generalize when multi-protocol
      const morphoUrl = new URL("market", "https://app.morpho.org")
      morphoUrl.searchParams.set("id", props.row.original.market.metadata.id)
      client &&
        morphoUrl.searchParams.set("network", client?.chain.name.toLowerCase())
      const isTestnet = chainId && chainId === sepolia.id

      return (
        <div>
          <a
            href={isTestnet ? "#" : morphoUrl.toString()}
            className="block w-min"
            target="_blank"
            rel="noopener"
          >
            <div className="flex w-min items-center rounded-full bg-accent p-3 hover:bg-accent/80">
              <ArrowRight size={16} />
            </div>
          </a>
        </div>
      )
    },
  },
]

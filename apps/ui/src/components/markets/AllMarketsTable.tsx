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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/base/table"
import * as dn from "dnum"
import { useAllMarkets } from "hooks/markets/useAllMarkets"
import { formatRate } from "utils/base/formatRate"
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
      <Table className="border">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="text-[#8A92A3]">
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

interface TokenPairProps {
  market: Market
  size?: number
}
function TokenPair(props: TokenPairProps) {
  return (
    <span className="-gap-2 flex">
      <img src={props.market.collateralToken.iconUrl} className="z-10 size-5" />
      <img src={props.market.loanToken.iconUrl} className="-ml-3 size-5" />
    </span>
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

      return (
        <div className="flex items-center gap-x-2 font-mono">
          <TokenPair market={row.original.market} />
          {getValue()}
          <Badge className="border-none px-1 text-xs text-[#8A92A3]">
            LLTV: {dn.format([BigInt(row.original.market.lltv), 16])}%
          </Badge>
        </div>
      )
    },
  },
  {
    header: "Liquidity",
    accessorFn: (row) => {
      return row.liquidity
    },
    cell: (props: CellContext<MarketInfo, bigint>) => {
      const { getValue } = props

      return (
        <div className="flex items-center gap-x-2 font-mono capitalize">
          {dn.format([getValue(), 18], {
            digits: 2,
            compact: true,
          })}{" "}
          {props.row.original.market.loanToken.symbol}
        </div>
      )
    },
  },
  {
    accessorKey: "borrowRate",
    header: () => <div className="text-right">Borrow Rate</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono lowercase">
        {fixed(row.getValue("borrowRate")).format({
          decimals: 2,
          percent: true,
        })}
      </div>
    ),
  },

  {
    accessorKey: "fixedRate",
    header: () => <div className="text-right">Fixed Borrow Rate</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <span className="gradient-text font-mono font-medium">
            {formatRate(row.getValue("fixedRate"))}
          </span>
        </div>
      )
    },
  },
]

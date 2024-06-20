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
    <div className="max-w-screen-xl w-full">
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
    <span>
      <img
        src={props.market.collateralToken.iconUrl}
        className="h-5 w-5 inline"
      />
      <img
        src={props.market.loanToken.iconUrl}
        className="h-5 w-5 inline -ml-3"
      />
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
        <div className="capitalize flex items-center gap-x-2 font-mono">
          <TokenPair market={row.original.market} />
          {getValue()}
          <Badge className="text-xs text-[#8A92A3] px-1 border-none">
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
        <div className="capitalize flex items-center gap-x-2 font-mono">
          {dn.format([getValue(), 18], {
            digits: 2,
            compact: true,
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "borrowRate",
    header: () => <div className="text-right">Borrow Rate</div>,
    cell: ({ row }) => (
      <div className="lowercase text-right font-mono">
        {formatRate(row.getValue("borrowRate"))}
      </div>
    ),
  },

  {
    accessorKey: "fixedRate",
    header: () => <div className="text-right">Fixed Borrow Rate</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <span className="gradient-text font-medium font-mono">
            {formatRate(row.getValue("fixedRate"))}
          </span>
        </div>
      )
    },
  },
  // {
  //   id: "actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const payment = row.original

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem
  //             onClick={() =>
  //               navigator.clipboard.writeText(payment.loanCollateralTag)
  //             }
  //           >
  //             Copy payment ID
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem>View customer</DropdownMenuItem>
  //           <DropdownMenuItem>View payment details</DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     )
  //   },
  // },
]

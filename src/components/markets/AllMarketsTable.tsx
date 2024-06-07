import {
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
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import * as React from "react"

import { useQuery } from "@tanstack/react-query"
import { Button } from "components/base/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/base/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/base/table"
import { MorphoMarketReader } from "lib/markets/MarketsReader"
import { formatUnits } from "viem"
import { useChainId, usePublicClient } from "wagmi"

export type MarketRowData = {
  loanCollateralTag: string
  liquidity: string
  borrowRate: bigint
  fixedRate: bigint
}

const columns: ColumnDef<MarketRowData>[] = [
  {
    accessorKey: "loanCollateralTag",
    header: "Collateral/Debt",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("loanCollateralTag")}</div>
    ),
  },
  {
    accessorKey: "liquidity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Liquidity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("liquidity")}</div>
    ),
  },
  {
    accessorKey: "borrowRate",
    header: () => <div className="text-right">Borrow Rate</div>,
    cell: ({ row }) => (
      <div className="lowercase text-right">
        {formatRate(row.getValue("borrowRate"))}
      </div>
    ),
  },

  {
    accessorKey: "fixedRate",
    header: () => <div className="text-right">Fixed Borrow Rate</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {formatRate(row.getValue("fixedRate"))}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(payment.loanCollateralTag)
              }
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function formatRate(rate: bigint, decimals = 18): string {
  // APR is stored in 18 decimals, so to avoid rounding errors, eg:
  // 0.049999999999999996 * 100 = 5, we just take the first 10 characters after
  // the decimal, and format those to a percent, eg: 0.0499999999 * 100 = 4.99.
  const truncatedAPR = +formatUnits(rate, decimals).slice(0, 10)
  const formatted = `${Number((100 * truncatedAPR).toFixed(2)).toLocaleString()}%`
  return formatted
}

function useAllMarkets() {
  const chainId = useChainId()
  const client = usePublicClient()
  return useQuery({
    queryKey: ["all-markets", chainId],
    queryFn: async (): Promise<MarketRowData[]> => {
      const allMarkets = await MorphoMarketReader.getAllMarketsInfo(
        client!,
        chainId
      )
      return allMarkets?.map((marketData) => ({
        loanCollateralTag: `${marketData.market.collateralToken.symbol}/${marketData.market.loanToken.symbol}`,
        liquidity: "100_000",
        fixedRate: marketData.fixedRate,
        borrowRate: marketData.borrowRate,
      }))
    },
    enabled: !!client,
  })
}

export function AllMarketsTable() {
  const { data = [] } = useAllMarkets()

  console.log(data)

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
    <div className="w-[1200px]">
      <div className="flex items-center py-4">
        {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu> */}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
      <div className="flex items-center justify-end space-x-2 py-4">
        {/* <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div> */}
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

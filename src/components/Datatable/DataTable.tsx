import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Row,
} from "@tanstack/react-table"

import {
    ChevronDown,
    MoreHorizontal,
    Trash,
    Loader2,
    Pencil
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Input } from "@/components/ui/input"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useNavigate } from "react-router-dom"

interface DataTableProps<TData> {
    columns: ColumnDef<TData>[]
    data: TData[]
    title: string
    totalCount: number
    onDelete?: (id: string) => void
    onDeleteSelected?: (ids: string[]) => void
    onEdit?: (id: string) => void
    isLoading?: boolean
    error?: string
    editPath?: string
    isDeleting?: boolean
}

export default function DataTable<TData extends { id: string }>({
    columns: columnsProp,
    data,
    totalCount,
    onDelete,
    onDeleteSelected,
    isLoading,
    error,
    editPath,
    isDeleting
}: DataTableProps<TData>) {
    const navigate = useNavigate()

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")

    const [{ pageIndex, pageSize }, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const columns = React.useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="dark:border-gray-400"
                    disabled={isDeleting}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="dark:border-gray-400"
                    disabled={isDeleting}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        ...columnsProp,
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const item = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800" disabled={isDeleting}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] dark:bg-gray-800">
                            <DropdownMenuLabel className="dark:text-white">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    if (editPath) {
                                        navigate(`${editPath}/${item.id}`)
                                    }
                                }}
                                className="dark:text-white dark:hover:bg-gray-700 cursor-pointer"
                                disabled={isDeleting}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        className="dark:text-red-400 dark:hover:bg-gray-700 dark:hover:text-red-300 cursor-pointer text-red-600"
                                        onSelect={(e) => e.preventDefault()}
                                        disabled={isDeleting}
                                    >
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="dark:bg-gray-800">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="dark:text-gray-400">
                                            This action cannot be undone. This will permanently delete the
                                            selected item and remove its data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="dark:bg-gray-700 dark:text-white" disabled={isDeleting}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(item)} disabled={isDeleting}>
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                "Continue"
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [columnsProp, editPath, isDeleting])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination: { pageIndex, pageSize },
            globalFilter,
        },
        enableRowSelection: !isDeleting,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination: true,
        pageCount: Math.ceil(totalCount / pageSize),
        globalFilterFn: (row: Row<TData>, _columnId: string, filterValue: string) => {
            const search = filterValue.toLowerCase();
            return Object.values(row.original as Record<string, unknown>).some(
                value =>
                    typeof value === 'string' &&
                    value.toLowerCase().includes(search)
            );
        },
    })

    const handleDelete = (item: TData) => {
        if (onDelete) {
            onDelete(item.id)
        }
    }

    const handleDeleteSelected = () => {
        if (onDeleteSelected) {
            const selectedItems = table
                .getFilteredSelectedRowModel()
                .rows.map((row) => row.original.id)
            onDeleteSelected(selectedItems)
        }
    }

    return (
        <div className="container mx-auto p-4 dark:bg-zinc-900 transition-colors duration-200">
            {/* <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold dark:text-white">{title}</h1>
            </div> */}
            <div className="w-full overflow-auto">
                <div className="flex items-center py-4 space-x-3">
                    <div className="flex items-center space-x-3">
                        <Input
                            placeholder="Search all columns..."
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="max-w-sm dark:bg-zinc-800 dark:border-slate-700 dark:text-white"
                            disabled={isDeleting}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="dark:border-gray-700 dark:text-white" disabled={isDeleting}>
                                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dark:bg-gray-800">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize dark:text-white"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                                disabled={isDeleting}
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        )
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {onDeleteSelected && (
                        <div className="flex items-center space-x-3">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={!table.getFilteredSelectedRowModel().rows.length || isDeleting}
                                    >
                                        {
                                            isDeleting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                "Delete Selected"
                                            )
                                        }
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="dark:bg-gray-800">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="dark:text-gray-400">
                                            This action cannot be undone. This will permanently delete the
                                            selected items and remove their data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="dark:bg-gray-700 dark:text-white" disabled={isDeleting}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteSelected} disabled={isDeleting}>
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                "Continue"
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
                <div className="rounded-md border dark:border-gray-700">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="dark:border-gray-700">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="dark:text-gray-400">
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center dark:text-gray-400"
                                    >
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-red-500 dark:text-red-400"
                                    >
                                        {error}
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="dark:border-gray-700"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="dark:text-gray-300">
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
                                        className="h-24 text-center dark:text-gray-400"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground dark:text-gray-400">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage() || isDeleting}
                            className="dark:border-gray-700 dark:text-white"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage() || isDeleting}
                            className="dark:border-gray-700 dark:text-white"
                        >
                            Next
                        </Button>
                    </div>
                </div>
                <div className="flex items-center space-x-2 py-4">
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            setPagination({ pageIndex: 0, pageSize: Number(value) })
                        }}
                        disabled={isDeleting}
                    >
                        <SelectTrigger className="w-[180px] dark:border-gray-700 dark:text-white">
                            <SelectValue placeholder="Select rows per page" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800">
                            <SelectItem value="10" className="dark:text-white">10 rows per page</SelectItem>
                            <SelectItem value="20" className="dark:text-white">20 rows per page</SelectItem>
                            <SelectItem value="50" className="dark:text-white">50 rows per page</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
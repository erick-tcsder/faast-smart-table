import {
  ColumnFiltersState,
  ColumnOrderState,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  GroupingState,
  useReactTable,
} from '@tanstack/react-table'
import React, { useRef } from 'react'
import { makeData } from './makeData'
import { useSkipper } from './hooks'
import {
  columns as defaultColumn,
  fuzzyFilter,
  getTableMeta,
} from './tableModels'
import DebouncedInput from './components/shared/DebouncedInput'
import ActionButtons from './components/shared/ActionButtons'
import CustomTable from './components/shared/CustomTable'
import { DownloadTableExcel } from 'react-export-table-to-excel';
import { DnDGroupingContainer } from './components/shared/DnDGroupingContainer'

export const reorderColumn = (
  draggedColumnId: string,
  targetColumnId: string,
  columnOrder: string[]
): ColumnOrderState => {
  columnOrder.splice(
    columnOrder.indexOf(targetColumnId),
    0,
    columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0]
  )
  return [...columnOrder]
}

export const App = () => {
  const tableRef = useRef<HTMLTableElement>(null)
  const rerender = React.useReducer(() => ({}), {})[1]
  
  const [columns] = React.useState(() => [...defaultColumn])

  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(
    ['select', 'expand',
  'firstname',
  'lastName',
  'fullName',
  'age',
  'visits',
  'status',
  'progress',]
  )

  const [data, setData] = React.useState(makeData(1000))
  const refreshData = () => setData(makeData(1000))

  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [grouping, setGrouping] = React.useState<GroupingState>([])
  const [isSplit, setIsSplit] = React.useState(false)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnPinning, setColumnPinning] = React.useState({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState('')

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    autoResetPageIndex,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onColumnVisibilityChange: setColumnVisibility,
    onGroupingChange: setGrouping,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
    // Provide our updateData function to our table meta
    meta: getTableMeta(setData, skipAutoResetPageIndex),
    state: {
      grouping,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnPinning,
      rowSelection,
      columnOrder
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  })

  React.useEffect(() => {
    if (table.getState().columnFilters[0]?.id === 'fullName') {
      if (table.getState().sorting[0]?.id !== 'fullName') {
        table.setSorting([{ id: 'fullName', desc: false }])
      }
    }
  }, [table.getState().columnFilters[0]?.id])

  return (
    <>
    <div className="p-2 grid grid-cols-4 gap-4">
        <div className="p-2">
          Search:
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            className="mx-1 p-2 font-lg shadow border border-block"
            placeholder="Search all columns..."
          />
        </div>
        <div className="p-2 inline-block border border-black shadow rounded">
          <div className="px-1 border-b border-black">
            <label>
              <input
                type="checkbox"
                checked={table.getIsAllColumnsVisible()}
                onChange={table.getToggleAllColumnsVisibilityHandler()}
                className="mr-1"
              />
              Toggle All
            </label>
          </div>
          {table.getAllLeafColumns().map(column => {
            return (
              <div key={column.id} className="px-1">
                <label>
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="mr-1"
                  />
                  {column.id}
                </label>
              </div>
            )
          })}
        </div>
        <div className="p-2">
          <div>
            <input
              type="checkbox"
              checked={isSplit}
              onChange={e => setIsSplit(e.target.checked)}
              className="mx-1"
            />
            Split Mode
          </div>
        </div>
      </div>
      <div>
        <DnDGroupingContainer columns={table.getAllLeafColumns()} groupedColumns={grouping} setGrouping={setGrouping} />
      </div>
      <div className={`d-flex ${isSplit ? 'gap-4' : ''}`}>
        {isSplit ? <CustomTable table={table} tableGroup="left" /> : null}
        <CustomTable
          table={table}
          tableGroup={isSplit ? 'center' : undefined}
          ref={tableRef}
          customRender={()=><span>asd</span>}
        />
        {isSplit ? <CustomTable table={table} tableGroup="right" /> : null}
      </div>
      <div className="p-2" />
      <ActionButtons
        getSelectedRowModel={table.getSelectedRowModel}
        hasNextPage={table.getCanNextPage()}
        hasPreviousPage={table.getCanPreviousPage()}
        nextPage={table.nextPage}
        pageCount={table.getPageCount()}
        pageIndex={table.getState().pagination.pageIndex}
        pageSize={table.getState().pagination.pageSize}
        previousPage={table.previousPage}
        refreshData={refreshData}
        rerender={rerender}
        rowSelection={rowSelection}
        setPageIndex={table.setPageIndex}
        setPageSize={table.setPageSize}
        totalRows={table.getPrePaginationRowModel().rows.length}
      />
      <div className="p-2" />
      <pre>{JSON.stringify(table.getState(), null, 2)}</pre>
      <DownloadTableExcel
        filename="table"
        sheet="persons"
        currentTableRef={tableRef.current}
      >
        <button className='btn btn-success'> Export excel </button>
      </DownloadTableExcel>
      </>
  )
}

export default App

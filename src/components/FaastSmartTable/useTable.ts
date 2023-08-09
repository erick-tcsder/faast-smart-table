import {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  GroupingState,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { fuzzyFilter } from "../../tableModels";
import { getLeafCols } from "../../utils/utils";

export interface TableProps<T> {
  defaultColumns: ColumnDef<
    T,
    {
      hideInExport?: boolean;
    }
  >[];
  data: T[];
  defaultColumnOrder?: string[]
}

export const useTable = <T>({ defaultColumns, data, defaultColumnOrder }: TableProps<T>) => {
  const [columns] = useState(() => [...defaultColumns]);
  const calculatedDefaultColumnOrder = useMemo(()=>{
    const colsOrd: string[] = []
    defaultColumns.map(c=>getLeafCols(colsOrd,c))
    return colsOrd
  },[defaultColumns])
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(defaultColumnOrder ?? calculatedDefaultColumnOrder);
  useEffect(()=>{
    setColumnOrder(calculatedDefaultColumnOrder)
  },[calculatedDefaultColumnOrder])

  const [columnVisibility, setColumnVisibility] = useState({});
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [isSplit, setIsSplit] = useState(true);
  const [rowSelection, setRowSelection] = useState({});
  const [columnPinning, setColumnPinning] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable<T>({
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
    autoResetPageIndex: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    onColumnVisibilityChange: setColumnVisibility,
    onGroupingChange: setGrouping,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
    state: {
      grouping,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnPinning,
      rowSelection,
      columnOrder,
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });
  return {
    table,
    columnOrder,
    setColumnOrder,
    columnVisibility,
    setColumnVisibility,
    grouping,
    setGrouping,
    isSplit,
    setIsSplit,
    rowSelection,
    setRowSelection,
    columnPinning,
    setColumnPinning,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
  };
};

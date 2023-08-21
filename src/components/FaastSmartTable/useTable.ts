import {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  GroupingState,
  SortingState,
  VisibilityState,
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { fuzzyFilter } from "../../tableModels";
import { getLeafCols } from "./utils/utils";

export type TableProfile = {
  columnOrder?: ColumnOrderState
  columnVisibility?: VisibilityState
  grouping?: GroupingState
  isSplit?: boolean
  columnPinning?: ColumnPinningState
  columnFilters?: ColumnFiltersState
  globalFilter?: string
  columnSizing?: ColumnSizingState
  sorting?: SortingState
}

export interface TableProps<T> {
  defaultColumns: ColumnDef<
    T,
    {
      hideInExport?: boolean;
      filterType?: string;
    }
  >[];
  data: T[];
  defaultProfile?: TableProfile | string;
  profiles?: {profile: TableProfile;id:string}[],
  currentProfile?: string
}

export const useTable = <T>({ defaultColumns, data, ...props}: TableProps<T>) => {
  const [columns] = useState(() => [...defaultColumns]);
  const calculatedDefaultColumnOrder = useMemo(()=>{
    const colsOrd: string[] = []
    defaultColumns.map(c=>getLeafCols(colsOrd,c))
    return colsOrd
  },[defaultColumns])
  const defaultProfile = useMemo<TableProfile | undefined>(()=>{
    if(typeof props.defaultProfile === 'string'){
      return props.defaultProfile ? props.profiles?.find(p=>p.id === props.defaultProfile)?.profile : undefined
    }
    return props.defaultProfile
  },[props.defaultProfile, props.profiles])
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(defaultProfile?.columnOrder ?? calculatedDefaultColumnOrder);
  useEffect(()=>{
    setColumnOrder(calculatedDefaultColumnOrder)
  },[calculatedDefaultColumnOrder])

  const [columnVisibility, setColumnVisibility] = useState(defaultProfile?.columnVisibility ?? {});
  const [grouping, setGrouping] = useState<GroupingState>(defaultProfile?.grouping ?? []);
  const [isSplit, setIsSplit] = useState(defaultProfile?.isSplit ?? true);
  const [rowSelection, setRowSelection] = useState({});
  const [columnPinning, setColumnPinning] = useState(defaultProfile?.columnPinning ?? {});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultProfile?.columnFilters ?? []);
  const [globalFilter, setGlobalFilter] = useState(defaultProfile?.globalFilter ?? "");
  const [columnSizing,setColumnSizing] = useState<ColumnSizingState>(defaultProfile?.columnSizing ?? {});
  const [sorting, setSorting] = useState<SortingState>(defaultProfile?.sorting ?? [])

  const [currentProfile,setCurrentProfile] = useState<TableProfile>()


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
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    state: {
      grouping,
      columnFilters,
      globalFilter,
      columnVisibility,
      columnPinning,
      rowSelection,
      columnOrder,
      columnSizing,
      sorting,
    }, 
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  useEffect(()=>{
    console.log('A :>> ');
    if(!props.currentProfile || !props.profiles?.length) return
    console.log('b :>> ');
    const newCurrentProfile = props?.profiles?.find(p=>p.id === props.currentProfile)?.profile
    if(JSON.stringify(newCurrentProfile) !== JSON.stringify(currentProfile)){
      console.log('C :>> ', newCurrentProfile, currentProfile);
      setColumnOrder(newCurrentProfile?.columnOrder ?? calculatedDefaultColumnOrder)
      setColumnVisibility(newCurrentProfile?.columnVisibility ?? {})
      setColumnFilters(newCurrentProfile?.columnFilters ?? [])
      setGrouping(newCurrentProfile?.grouping ?? [])
      setIsSplit(newCurrentProfile?.isSplit ?? true)
      setColumnPinning(newCurrentProfile?.columnPinning ?? {})
      setGlobalFilter(newCurrentProfile?.globalFilter ?? "")
      setColumnSizing(newCurrentProfile?.columnSizing ?? {})
      setSorting(newCurrentProfile?.sorting ?? [])
    }
  },[currentProfile, props.profiles])

  useEffect(()=>{
    if(!props.currentProfile || !props.profiles?.length) return
    const currentProfile = props?.profiles?.find(p=>p.id === props.currentProfile)?.profile
    setColumnOrder(currentProfile?.columnOrder ?? calculatedDefaultColumnOrder)
    setColumnVisibility(currentProfile?.columnVisibility ?? {})
    setGrouping(currentProfile?.grouping ?? [])
    setIsSplit(currentProfile?.isSplit ?? true)
    setColumnPinning(currentProfile?.columnPinning ?? {})
    setColumnFilters(currentProfile?.columnFilters ?? [])
    setGlobalFilter(currentProfile?.globalFilter ?? "")
    setColumnSizing(currentProfile?.columnSizing ?? {})
    setSorting(currentProfile?.sorting ?? [])
    setCurrentProfile(currentProfile)
  },[props.currentProfile,props.profiles])

  const exportProfile = useCallback<()=>{profile: TableProfile;id?:string}>(()=>{
    return {
      id: props.currentProfile,
      profile: {
        columnFilters,
        columnOrder,
        columnPinning,
        columnSizing,
        columnVisibility,
        globalFilter,
        grouping,
        isSplit,
        sorting
      }
    }
  },[columnFilters, columnOrder, columnPinning, columnSizing, columnVisibility, globalFilter, grouping, isSplit, props.currentProfile, sorting])

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
    sorting,
    setSorting,
    columnSizing,
    setColumnSizing,
    exportProfile
  };
};

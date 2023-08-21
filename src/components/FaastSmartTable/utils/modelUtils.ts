import { RankingInfo, compareItems, rankItem } from "@tanstack/match-sorter-utils"
import { FilterFn, SortingFn, sortingFns } from "@tanstack/react-table"
import dayjs from "dayjs"

export const fuzzyFilter: FilterFn<any> = (
    row,
    columnId,
    value,
    addMeta
  ) => {
    // Rank the item
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const itemRank = rankItem(row.getValue(columnId), value)
  
    // Store the ranking info
    addMeta(itemRank)
  
    // Return if the item should be filtered in/out
    return itemRank.passed
  }
  
  export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
    let dir = 0
  
    // Only sort by rank if the column has ranking information
    if (rowA.columnFiltersMeta[columnId]) {
      dir = compareItems(
        rowA.columnFiltersMeta[columnId]! as RankingInfo,
        rowB.columnFiltersMeta[columnId]! as RankingInfo
      )
    }
  
    // Provide an alphanumeric fallback for when the item ranks are equal
    return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir
  }
  
  export const strictListFilter : FilterFn<unknown> = (row,
    columnId,
    value)=>{
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return (value as string[]).includes(row.getValue(columnId))
  }
  
  export const dateRangeFilter : FilterFn<unknown> = (row,columnId,value)=>{
    const [dateA,dateB] = value as [Date,Date]
    return (!dateA || dayjs(dateA).isBefore(dayjs(row.getValue(columnId)),'day')) && (!dateB || dayjs(dateB).isAfter(dayjs(row.getValue(columnId)),'day'))
  }
  
  export type TableMeta = {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
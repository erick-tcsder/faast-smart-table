import {
  ColumnOrderState,
} from '@tanstack/react-table'
import { FaastSmartTable, useTable } from './components/FaastSmartTable'
import { columns } from './tableModels'
import { makeData } from './makeData'
import { useState } from 'react'

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
  const [data] = useState(makeData(1000))
  const {
    ...pr
  } = useTable({
    defaultColumns: columns,
    data: data
  })


  console.log('pr.rowSelection :>> ', pr.rowSelection);

  return (
    <>
      <FaastSmartTable table={pr.table}
      title={"TEST TABLE"}
      allowGlobalFilter
      allowColumnSubcomponents
      allowResizeCols
      allowReorderCols
      allowColumnFilter
      allowColumnPinning
      allowColumnSorting
      allowColumnGrouping
      allowHandleVisibility
      allowNativeExcelDownload
      grouping={pr.grouping}
      setGrouping={pr.setGrouping}
      globalFilter={pr.globalFilter}
      setGlobalFilter={pr.setGlobalFilter}
      customRender={(row)=><pre>{JSON.stringify(row,null,2)}</pre>}
      />
    </>
  )
}

export default App

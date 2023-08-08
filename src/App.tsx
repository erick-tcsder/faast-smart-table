import {
  ColumnOrderState,
} from '@tanstack/react-table'

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
  return (
    <>

    </>
  )
}

export default App

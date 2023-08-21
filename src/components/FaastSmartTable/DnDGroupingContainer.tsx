/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ReactNode, useCallback } from "react"
import { useDrop, useDrag } from "react-dnd"
import update from 'immutability-helper'
import { Column, ColumnDef, ColumnDefTemplate, HeaderContext, RowData} from "@tanstack/react-table"

type Props<T> = {
    columns: ColumnDef<T>[]
    groupedColumns: string[],
    setGrouping: (newGrouped: string[])=>void
}

export const DnDGroupingContainer = <T extends RowData>({groupedColumns,setGrouping,columns}:Props<T>) => {
    const findCard = useCallback(
      (id:string) => {
        const card = groupedColumns.filter((c) => c === id)[0]
        return {
          card,
          index: groupedColumns.indexOf(card),
        }
      },
      [groupedColumns],
    )
    const moveCard = useCallback(
      (id:string, atIndex:number) => {
        const { card, index } = findCard(id)
        setGrouping(
          update(groupedColumns, {
            $splice: [
              [index, 1],
              [atIndex, 0, card],
            ],
          }),
        )
      },
      [findCard, groupedColumns, setGrouping],
    )
    const removeCard = useCallback((id:string)=>{
        setGrouping(groupedColumns.filter((c)=>c!==id))
    },[groupedColumns, setGrouping])
    const [, drop] = useDrop(() => ({ accept: 'card' }))
    
    const [,dropcreate] = useDrop(()=>({
      accept: 'column',
      drop(draggedColumn: Column<T>){
        groupedColumns.includes(draggedColumn.id) ? setGrouping([...groupedColumns]) : setGrouping([...groupedColumns, draggedColumn.id])
      }
    }),[groupedColumns])
    return (
      <div ref={dropcreate} className="py-2 px-3 rounded">
        <div ref={drop} className="d-flex gap-2 p-2" style={{
          borderRadius: '5px',
          border: '1px dashed #ccc'
        }}>
          {groupedColumns.length ? (groupedColumns.map((card) => (
            <Card
              key={card}
              id={`${card}`}
              text={(columns.filter((c)=>c.id===card)[0]).header}
              moveCard={moveCard}
              findCard={findCard}
              removeCard={removeCard}
            />
          ))) : <span>Arrastre las Columnas Para Agrupar</span>}
        </div>
      </div>
    )
  }

const Card = <T extends RowData>({ id, text, moveCard, findCard, removeCard } : {
    id:string,
    text?:ColumnDefTemplate<HeaderContext<T, unknown>>,
    moveCard: (id:string, atIndex:number)=>void,
    findCard: (id:string)=>{card:string, index:number}
    removeCard: (id:string)=>void
}) => {
  const originalIndex = findCard(id).index
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'card',
      item: { id, originalIndex },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const { id: droppedId, originalIndex } = item
        const didDrop = monitor.didDrop()
        if (!didDrop) {
          moveCard(droppedId, originalIndex)
        }
      },
    }),
    [id, originalIndex, moveCard],
  )
  const [, drop] = useDrop(
    () => ({
      accept: 'card',
      hover(item: { id:string, originalIndex:number }) {
        if (item?.id !== id) {
          const { index: overIndex } = findCard(id)
          moveCard(item?.id, overIndex)
        }
      },
    }),
    [findCard, moveCard],
  )
  const opacity = isDragging ? 0 : 1
  return (
      <div ref={(node) => drag(drop(node))} className="d-flex" style={{
        padding: '0.5rem 1rem',
        backgroundColor: "#d7e5fc",
        borderRadius: '5px',
        cursor: 'move',
        opacity }}>
        {text as ReactNode ?? id}
        <button className="btn btn-sm btn-danger ms-3" onClick={()=>removeCard(id)}>X</button>
      </div>
  )
}

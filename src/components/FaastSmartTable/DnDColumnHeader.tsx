/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Column, ColumnOrderState, Header, RowData, Table, flexRender } from "@tanstack/react-table";
import { FilterOverlay } from "./Filter";
import { ColumnMenu } from "./ColumnMenu/ColumnMenu";
import { useDrag, useDrop } from "react-dnd";

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

export const DnDColumnHeader = <T extends RowData>({
  header,
  table,
  allowResizeCols,
  allowColumnFilter,
  allowReorderCols,
  allowColumnPinning,
  allowColumnSorting,
  allowColumnGrouping
}: {
  header: Header<T, unknown>;
  table: Table<T>;
  allowResizeCols?: boolean;
  allowReorderCols?: boolean;
  allowColumnFilter?: boolean;
  allowColumnPinning?: boolean;
  allowColumnSorting?: boolean;
  allowColumnGrouping?: boolean;
}) => {
  const { getState, setColumnOrder } = table
  const { columnOrder } = getState()
  const { column } = header  
  const [, dropRef] = useDrop({
    accept: 'column',
    drop: (draggedColumn: Column<T>) => {
      const newColumnOrder = reorderColumn(
        draggedColumn.id,
        column.id,
        columnOrder
      )
      setColumnOrder(newColumnOrder)
    },
  })
  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => column,
    type: 'column',
  })

  return (
    <th
      ref={dropRef}
      className="position-relative"
      key={header.id}
      style={{
        width: header.getSize(),
        ...(header.column.getIsGrouped()
          ? {
              backgroundColor: "#d7e5fc",
            }
          : {}),
        opacity: isDragging ? 0.5 : 1
      }}
      colSpan={header.colSpan}
    >
      <div ref={previewRef}>
        {header.isPlaceholder ? null : (
          <>
            <div className="d-flex justify-content-between">
              {flexRender(header.column.columnDef.header, header.getContext())}
              <div className="d-flex align-self-center">
                {(allowReorderCols || allowColumnGrouping) && !header.column.columns.length && (
                  <div ref={dragRef} className="text-secondary px-1 align-self-center"><i className="fas fa-up-down-left-right"/></div>
                )}
                {(allowColumnFilter && header.column.getCanFilter()) ? (
                  <FilterOverlay column={header.column} table={table} />
                ) : null}
                <ColumnMenu header={header as any} allowColumnGrouping={allowColumnGrouping} allowColumnPinning={allowColumnPinning} allowColumnSorting={allowColumnSorting}/>
              </div>
            </div>
            {allowResizeCols && (
              <div
                className="position-absolute h-100 bg-secondary"
                style={{
                  right: 0,
                  top: 0,
                  cursor: "col-resize",
                  width: "2px",
                }}
                onMouseDown={header.getResizeHandler()}
                onTouchStart={header.getResizeHandler()}
              />
            )}
          </>
        )}
      </div>
    </th>
  );
};

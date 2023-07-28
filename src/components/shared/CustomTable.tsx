/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  flexRender,
  HeaderGroup,
  Row,
  RowData,
  Table,
} from '@tanstack/react-table'
import React from 'react'
import { DnDColumnHeader } from './DnDColumnHeader'

type TableGroup = 'center' | 'left' | 'right'

function getTableHeaderGroups<T extends RowData>(
  table: Table<T>,
  tg?: TableGroup
): [HeaderGroup<T>[], HeaderGroup<T>[]] {
  if (tg === 'left') {
    return [table.getLeftHeaderGroups(), table.getLeftFooterGroups()]
  }

  if (tg === 'right') {
    return [table.getRightHeaderGroups(), table.getRightFooterGroups()]
  }

  if (tg === 'center') {
    return [table.getCenterHeaderGroups(), table.getCenterFooterGroups()]
  }

  return [table.getHeaderGroups(), table.getFooterGroups()]
}

function getRowGroup<T extends RowData>(row: Row<T>, tg?: TableGroup) {
  if (tg === 'left') return row.getLeftVisibleCells()
  if (tg === 'right') return row.getRightVisibleCells()
  if (tg === 'center') return row.getCenterVisibleCells()
  return row.getVisibleCells()
}

interface Props<T extends RowData>{
  table: Table<T>
  tableGroup?: TableGroup,
  customRender: (props: { row: Row<T> }) => React.ReactElement
}

export const CustomTable = React.forwardRef<HTMLTableElement,any>((props,ref)=>{
  const {table, tableGroup, customRender} = props as Props<RowData>
  const [headerGroups] = getTableHeaderGroups(table, tableGroup)
  return (
    <>
      <table>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <DnDColumnHeader header={header} table={table}/>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row: Row<unknown>) => (
            <>
                <tr key={row.id}>
                {getRowGroup(row, undefined).map(cell => {
                  return (
                    <td
                      {...{
                        key: cell.id,
                        style: {
                          background: cell.getIsGrouped()
                            ? 'white'
                            : cell.getIsAggregated()
                            ? 'white'
                            : cell.getIsPlaceholder()
                            ? 'var(--bs-light)'
                            : 'var(--bs-light)',
                        },
                      }}
                    >
                      {cell.getIsGrouped() ? (
                        // If it's a grouped cell, add an expander and row count
                        <>
                          <button
                            {...{
                              onClick: row.getToggleExpandedHandler(),
                              style: {
                                cursor: row.getCanExpand()
                                  ? 'pointer'
                                  : 'normal',
                                border: 'none',
                                backgroundColor: 'transparent'
                              },
                              className: ""
                            }}
                          >
                            <span>{row.getIsExpanded() ? '↓' : '→'}</span>{' '}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}{' '}
                            <span className='text-muted'>({row.subRows.length})</span>
                          </button>
                        </>
                      ) : cell.getIsAggregated() ? (
                        // If the cell is aggregated, use the Aggregated
                        // renderer for cell
                        flexRender(
                          cell.column.columnDef.aggregatedCell ??
                            cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                        // Otherwise, just render the regular cell
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </td>
                  )
                })}
              </tr>
              {row.getIsExpanded() && (
                <tr>
                  <td colSpan={row.getVisibleCells().length}>
                    {customRender({ row })}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
      <table className='d-none' ref={ref}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => !((header.column.columnDef?.meta as {hideInExport?:boolean})?.hideInExport) ? (
                <DnDColumnHeader header={header} table={table}/>
              ) : null)}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getPrePaginationRowModel().rows.map((row: Row<unknown>) => (
            <>
                <tr key={row.id}>
                {getRowGroup(row, tableGroup).map(cell => !((cell.column.columnDef?.meta as {hideInExport?:boolean})?.hideInExport) ? (
                    <td
                      {...{
                        key: cell.id,
                        style: {
                          background: cell.getIsGrouped()
                            ? 'white'
                            : cell.getIsAggregated()
                            ? 'white'
                            : cell.getIsPlaceholder()
                            ? 'var(--bs-light)'
                            : 'var(--bs-light)',
                        },
                      }}
                    >
                      {cell.getIsGrouped() ? (
                        // If it's a grouped cell, add an expander and row count
                        <>
                          <button
                            {...{
                              onClick: row.getToggleExpandedHandler(),
                              style: {
                                cursor: row.getCanExpand()
                                  ? 'pointer'
                                  : 'normal',
                                border: 'none',
                                backgroundColor: 'transparent'
                              },
                              className: ""
                            }}
                          >
                            <span>{row.getIsExpanded() ? '↓' : '→'}</span>{' '}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}{' '}
                            <span className='text-muted'>({row.subRows.length})</span>
                          </button>
                        </>
                      ) : cell.getIsAggregated() ? (
                        // If the cell is aggregated, use the Aggregated
                        // renderer for cell
                        flexRender(
                          cell.column.columnDef.aggregatedCell ??
                            cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                        // Otherwise, just render the regular cell
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </td>
                  ) : null)}
              </tr>
              {row.getIsExpanded() && (
                <tr>
                  <td colSpan={row.getVisibleCells().length}>
                    {customRender({ row })}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </>
  )
})

export default CustomTable

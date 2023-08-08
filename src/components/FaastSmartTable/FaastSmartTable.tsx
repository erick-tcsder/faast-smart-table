import React, { useEffect, useRef, useState } from "react";
import {
  flexRender,
  GroupingState,
  HeaderGroup,
  Row,
  RowData,
  Table,
} from "@tanstack/react-table";
import { DnDColumnHeader } from "../shared/DnDColumnHeader";
import { DnDGroupingContainer } from "../shared/DnDGroupingContainer";
import { Dropdown, Modal } from "react-bootstrap";
import { DownloadTableExcel } from "react-export-table-to-excel";
import DebouncedInput from "../shared/DebouncedInput";
import ActionButtons from "../shared/ActionButtons";

type TableGroup = "center" | "left" | "right";

function getTableHeaderGroups<T extends RowData>(
  table: Table<T>,
  tg?: TableGroup
): [HeaderGroup<T>[], HeaderGroup<T>[]] {
  if (tg === "left") {
    return [table.getLeftHeaderGroups(), table.getLeftFooterGroups()];
  }

  if (tg === "right") {
    return [table.getRightHeaderGroups(), table.getRightFooterGroups()];
  }

  if (tg === "center") {
    return [table.getCenterHeaderGroups(), table.getCenterFooterGroups()];
  }

  return [table.getHeaderGroups(), table.getFooterGroups()];
}

function getRowGroup<T extends RowData>(row: Row<T>, tg?: TableGroup) {
  if (tg === "left") return row.getLeftVisibleCells();
  if (tg === "right") return row.getRightVisibleCells();
  if (tg === "center") return row.getCenterVisibleCells();
  return row.getVisibleCells();
}

interface Props<T extends RowData> {
  table: Table<T>;
  tableGroup?: TableGroup;
  customRender: (row: Row<T>) => React.ReactElement;
  title: string | React.ReactElement
  allowGlobalFilter: boolean;
  allowColumnSubcomponents: boolean;
  allowResizeCols: boolean;
  allowReorderCols: boolean;
  allowColumnFilter: boolean;
  allowColumnPinning: boolean;
  allowColumnSorting: boolean;
  allowColumnGrouping: boolean;
  allowHandleVisibility: boolean;
  allowNativeExcelDownload: boolean;
  grouping: GroupingState;
  setGrouping: (v: GroupingState) => void;
  globalFilter: string;
  setGlobalFilter: (value:string)=>void
}

export const FaastSmartTable = React.forwardRef<HTMLTableElement, any>(
  (props, ref) => {
    const {
      table,
      title,
      customRender,
      grouping,
      setGrouping,
      globalFilter,
      setGlobalFilter,
      allowColumnSubcomponents,
      allowNativeExcelDownload,
      allowGlobalFilter,
      ...restProps
    } = props as Props<RowData>;
    const refDownload = useRef<HTMLTableElement|null>()
    const [isGrouping, setIsGrouping] = useState(Boolean(table.getState()?.grouping?.length))
    const [showVisibility, setShowVisibility] = useState(false)

    useEffect(()=>{
      setIsGrouping(Boolean(table.getState()?.grouping?.length))
    },[table])
    return (
      <>
      <div className="d-flex justify-content-between">
        {title}
        <div className="d-flex">
          {allowGlobalFilter && (
            <div className="p-2">
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                className="mx-1 p-2 font-lg shadow border border-block"
                placeholder="Buscar ..."
              />
            </div>
          )}
          {allowNativeExcelDownload && (
            <Dropdown>
              <Dropdown.Toggle
                variant="primary"
                id="dropdown-basic"
                className="btn-sm"
              >Descargar</Dropdown.Toggle>
              <Dropdown.Menu>
                {allowNativeExcelDownload && (
                  <DownloadTableExcel
                    filename="table"
                    sheet="persons"
                    currentTableRef={refDownload}
                  >
                    <li role="button" className='dropdown-item' style={{cursor: 'pointer'}}> Export excel </li>
                  </DownloadTableExcel>
                )}
              </Dropdown.Menu>
            </Dropdown>
          )}

          <Dropdown>
            <Dropdown.Toggle
              variant="secondary"
              id="dropdown-basic"
              className="btn-sm"
            >Opciones</Dropdown.Toggle>
            <Dropdown.Menu>
              {restProps.allowColumnGrouping && (
                <li onClick={()=>{isGrouping ? table.setState((old)=>{
                  return {
                    ...old,
                    grouping: []
                  }
                }) : setIsGrouping(true)}} className="dropdown-item">{isGrouping ? `Desagrupar` : `Agrupar`}</li>
              )}
              {

              }
              <li onClick={()=>{setShowVisibility(true)}}>Visibilidad de Columnas</li>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      {restProps.allowColumnGrouping && (<div>
        <DnDGroupingContainer
          columns={table.getAllLeafColumns()}
          groupedColumns={grouping}
          setGrouping={setGrouping}
        />
      </div>)}
      <div className="w-100 d-flex position-relative" style={{
        overflow: 'auto'
      }}>
        {["left", "center", "right"].map(hg=>(
          <table style={{
            position: ["left","right"].includes(hg) ? 'sticky' : 'static',
            left: hg === 'left' ? 0 : undefined,
            right: hg === 'right' ? 0 : undefined,
          }}>
            <thead>
              {getTableHeaderGroups(table,hg as TableGroup)[0].map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <DnDColumnHeader header={header} table={table} {...restProps}/>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row: Row<unknown>) => (
                <>
                  <tr key={row.id}>
                    {getRowGroup(row, undefined).map((cell) => {
                      return (
                        <td
                          {...{
                            key: cell.id,
                            style: {
                              background: cell.getIsGrouped()
                                ? "white"
                                : cell.getIsAggregated()
                                ? "white"
                                : cell.getIsPlaceholder()
                                ? "var(--bs-light)"
                                : "var(--bs-light)",
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
                                      ? "pointer"
                                      : "normal",
                                    border: "none",
                                    backgroundColor: "transparent",
                                  },
                                  className: "",
                                }}
                              >
                                <span>{row.getIsExpanded() ? "↓" : "→"}</span>{" "}
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}{" "}
                                <span className="text-muted">
                                  ({row.subRows.length})
                                </span>
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
                      );
                    })}
                  </tr>
                  {allowColumnSubcomponents && row.getIsExpanded() && !row.getIsGrouped() && (
                    <tr>
                      <td colSpan={row.getVisibleCells().length}>
                        {customRender(row)}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        ))}
      </div>
      <div className="mt-3">
        <ActionButtons
          getSelectedRowModel={table.getSelectedRowModel}
          hasNextPage={table.getCanNextPage()}
          hasPreviousPage={table.getCanPreviousPage()}
          nextPage={table.nextPage}
          pageCount={table.getPageCount()}
          pageIndex={table.getState().pagination.pageIndex}
          pageSize={table.getState().pagination.pageSize}
          previousPage={table.previousPage}
          setPageIndex={table.setPageIndex}
          setPageSize={table.setPageSize}
          totalRows={table.getPrePaginationRowModel().rows.length}
        />
      </div>
      <Modal show={showVisibility} onBackdropClick={()=>setShowVisibility(false)} size="sm" centered>
        <Modal.Body title="Visibilidad">
          <div className="p-2 inline-block">
            <div className="px-1 border-b border-black">
              <label>
                <input
                  type="checkbox"
                  checked={table.getIsAllColumnsVisible()}
                  onChange={table.getToggleAllColumnsVisibilityHandler()}
                  className="mr-1"
                />
                Mostrar/Ocultar Todas
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
          <div className="d-flex">
            <button className="btn btn-muted w-auto">Cancelar</button>
            <button className="btn btn-brand w-auto">Aceptar</button>
          </div>
        </Modal.Body>
      </Modal>










      {/*
      ALERT!!!!
      Even if it looks the same as above this component works as a blueprint for excel axport 
      ... only remove it if you are removing excel export
      */}
      <table className="d-none" ref={r=>{
          refDownload.current = r
          if (typeof ref === 'function') {
            ref(r);
          } else if (ref) {
            ref.current = r;
          }
        }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) =>
                  !(header.column.columnDef?.meta as { hideInExport?: boolean })
                    ?.hideInExport ? (
                    <DnDColumnHeader
                      header={header}
                      table={table}
                      key={header.id}
                      
                    />
                  ) : null
                )}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getPrePaginationRowModel().rows.map((row: Row<unknown>) => (
              <>
                <tr key={row.id}>
                  {getRowGroup(row, undefined).map((cell) =>
                    !(cell.column.columnDef?.meta as { hideInExport?: boolean })
                      ?.hideInExport ? (
                      <td
                        {...{
                          key: cell.id,
                          style: {
                            background: cell.getIsGrouped()
                              ? "white"
                              : cell.getIsAggregated()
                              ? "white"
                              : cell.getIsPlaceholder()
                              ? "var(--bs-light)"
                              : "var(--bs-light)",
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
                                    ? "pointer"
                                    : "normal",
                                  border: "none",
                                  backgroundColor: "transparent",
                                },
                                className: "",
                              }}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}{" "}
                              <span className="text-muted">
                                ({row.subRows.length})
                              </span>
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
                    ) : null
                  )}
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </>
    );
  }
);

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
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
import { useDownloadExcel } from "react-export-table-to-excel";
import DebouncedInput from "../shared/DebouncedInput";
import ActionButtons from "../shared/ActionButtons";
import dayjs from "dayjs";

type TableGroup = string;

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
  exportedFileName?: string; 
  title: string | React.ReactElement
  customRender?: (row: Row<T>) => React.ReactElement;
  grouping: GroupingState;
  setGrouping: (v: GroupingState) => void;
  globalFilter: string;
  setGlobalFilter: (value:string)=>void
  allowNativeExcelDownload: boolean;
  allowColumnSubcomponents: boolean;
  allowGlobalFilter: boolean;
  allowResizeCols: boolean;
  allowReorderCols: boolean;
  allowColumnFilter: boolean;
  allowColumnPinning: boolean;
  allowColumnSorting: boolean;
  allowColumnGrouping: boolean;
  allowHandleVisibility: boolean;
}

export const FaastSmartTable = <T extends RowData>(props: Props<T>) => {
    const {
      table,
      exportedFileName,
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
    } = props;
    const refDownload = useRef<HTMLTableElement|null>(null)
    const [isGrouping, setIsGrouping] = useState(Boolean(table.getState()?.grouping?.length))
    const [showVisibility, setShowVisibility] = useState(false)
    const {
      onDownload
    } = useDownloadExcel({
      currentTableRef: refDownload.current,
      filename: (exportedFileName ?? (typeof title === 'string' ? title : "Tabla")) + "_" + dayjs().format("YYYY_MM_DDTHH:mm:ss"),
    })
    useEffect(()=>{
      setIsGrouping(Boolean(table.getState()?.grouping?.length))
    },[table])
    return (
      <div className="w-100">
      <div className="d-flex justify-content-between px-2">
        <span className="h3 align-self-center mb-0">
          {title}
        </span>
        <div className="d-flex">
          {allowGlobalFilter && (
            <div className="p-2">
              <DebouncedInput
                value={globalFilter ?? ''}
                onChange={value => setGlobalFilter(String(value))}
                className="mx-1 p-2 font-lg border border-block rounded"
                placeholder="Buscar ..."
              />
            </div>
          )}
          {allowNativeExcelDownload && (
            <Dropdown className="align-self-center">
              <Dropdown.Toggle
                variant="primary"
                id="dropdown-basic"
                className="btn align-self-center my-auto h-100 py-2"
              >Descargar</Dropdown.Toggle>
              <Dropdown.Menu>
                <button role="button" onClick={()=>onDownload()} className='dropdown-item' style={{cursor: 'pointer'}}> Export excel </button>
              </Dropdown.Menu>
            </Dropdown>
          )}

          <Dropdown className="align-self-center ms-2">
            <Dropdown.Toggle
              variant="secondary"
              id="dropdown-basic"
              className="btn align-self-center my-auto h-100 py-2"
            >Opciones</Dropdown.Toggle>
            <Dropdown.Menu>
              {restProps.allowColumnGrouping && (
                <Dropdown.Item style={{cursor: 'pointer'}} onClick={isGrouping ? ()=>{table.setState((old)=>{
                  return {
                    ...old,
                    grouping: []
                  }
                }); setIsGrouping(false)} : ()=>setIsGrouping(true)}>{isGrouping ? `Desagrupar` : `Agrupar`}</Dropdown.Item>
              )}
              {

              }
              <Dropdown.Item onClick={()=>{setShowVisibility(true)}}>Visibilidad de Columnas</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      {restProps.allowColumnGrouping && isGrouping && (<div>
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
          }} key={hg}>
            <thead>
              {getTableHeaderGroups(table,hg)[0].map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <DnDColumnHeader header={header} table={table} {...restProps} key={header.id}/>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row: Row<T>) => (
                <>
                  <tr key={row.id}>
                    {getRowGroup(row, hg).map((cell) => {
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
                  {allowColumnSubcomponents && row.getIsExpanded() && !row.getIsGrouped() && Boolean(customRender) && hg ==='center' && (
                    <tr>
                      <td colSpan={row.getVisibleCells().length}>
                        {customRender?.(row)}
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
      <Modal show={showVisibility} onHide={()=>setShowVisibility(false)} onBackdropClick={()=>setShowVisibility(false)} size="sm" centered>
        <Modal.Body title="Visibilidad">
          <div className="p-2 inline-block">
            <div className="px-1 border p-2 border-b border-black">
              <label className="">
                <input
                  type="checkbox"
                  checked={table.getIsAllColumnsVisible()}
                  onChange={table.getToggleAllColumnsVisibilityHandler()}
                  className="me-2"
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
                      className="me-2"
                    />
                    {column.id}
                  </label>
                </div>
              )
            })}
          </div>
          <div className="d-flex gap-2">
            <button onClick={()=>{setShowVisibility(false)}} className="btn btn-primary w-100">Aceptar</button>
          </div>
        </Modal.Body>
      </Modal>










      {/*
      ALERT!!!!
      Even if it looks the same as above this component works as a blueprint for excel axport 
      ... only remove it if you are removing excel export
      */}
      <table className="d-none" ref={refDownload}>
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
            {table.getPrePaginationRowModel().rows.map((row: Row<T>) => (
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
      </div>
    );
  }

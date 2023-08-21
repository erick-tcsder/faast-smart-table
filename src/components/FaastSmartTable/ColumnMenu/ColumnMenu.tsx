import React from "react";
import { Dropdown, } from "react-bootstrap";
import './index.css'
import { PingItem } from "./PingItem";
import { Header, RowData } from "@tanstack/react-table";

export function ColumnMenu<T extends RowData>(props: React.PropsWithChildren<{header:Header<T,unknown>,
  allowColumnPinning?: boolean,
  allowColumnSorting?: boolean,
  allowColumnGrouping?: boolean
}>) {
  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="secondary"
        id="dropdown-basic"
        className="btn-sm"
      ></Dropdown.Toggle>
      <Dropdown.Menu>
        {props.allowColumnPinning && !props.header.isPlaceholder && props.header.column.getCanPin() && (
          <PingItem pinged={props.header.column.getIsPinned()} handleChangePinged={props.header.column.pin}/>
        )}
        {props.allowColumnSorting && props.header.column.getCanSort() && (
          <div onClick={props.header.column.getToggleSortingHandler()} className="dropdown-item">Ordenar ({{
            asc: '🔼',
            desc: '🔽',
          }[props.header.column.getIsSorted() as string] ?? '📶'})</div>
        )}
        {props.allowColumnGrouping && props.header.column.getCanGroup() && (
          <div onClick={props.header.column.getToggleGroupingHandler()} className="dropdown-item">{props.header.column.getIsGrouped()
            ? `Desagrupar(${props.header.column.getGroupedIndex()})`
            : `Agrupar`}</div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}


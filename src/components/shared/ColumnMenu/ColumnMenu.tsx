import React from "react";
import { Dropdown, } from "react-bootstrap";
import './index.css'
import { PingItem } from "./PingItem";
import { Header } from "@tanstack/react-table";

export function ColumnMenu<T>(props: React.PropsWithChildren<{header:Header<T,unknown>}>) {
  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="secondary"
        id="dropdown-basic"
        className="btn-sm"
      ></Dropdown.Toggle>
      <Dropdown.Menu>
        {!props.header.isPlaceholder && props.header.column.getCanPin() && (
          <PingItem pinged={props.header.column.getIsPinned()} handleChangePinged={props.header.column.pin}/>
        )}
        {props.header.column.getCanSort() && (
          <li onClick={props.header.column.getToggleSortingHandler()} className="dropdown-item">Ordenar ({{
            asc: '🔼',
            desc: '🔽',
          }[props.header.column.getIsSorted() as string] ?? '📶'})</li>
        )}
        {props.header.column.getCanGroup() && (
          <li onClick={props.header.column.getToggleGroupingHandler()} className="dropdown-item">{props.header.column.getIsGrouped()
            ? `Desagrupar(${props.header.column.getGroupedIndex()})`
            : `Agrupar`}</li>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}


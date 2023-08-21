/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  ColumnDef,
  FilterFn,
  SortingFn,
  TableMeta,
  sortingFns,
} from '@tanstack/react-table'
import React from 'react'
import { Person } from './makeData'
import IndeterminateCheckbox from './components/FaastSmartTable/InderterminateCheckbox'
import dayjs from 'dayjs'
import { dateRangeFilter, fuzzySort, strictListFilter } from './components/FaastSmartTable/utils/modelUtils'

export const columns: ColumnDef<Person>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <IndeterminateCheckbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <div className="px-1">
        <IndeterminateCheckbox
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      </div>
    ),
    meta: {
      hideInExport: true
    },
    enableGrouping: false,
    aggregatedCell: ({ row }) => {
      return (
        <div>
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
        </div>
      );
    },
  },
  {
    id: 'expand',
    header: 'Detalles',
    cell: ({ row }) => (
      <div className="px-1">
        <button
          {...{
            onClick: ()=>{row.toggleExpanded()},
            style: {
              cursor: row.getCanExpand()
                ? 'pointer'
                : 'normal',
            },
            className: "btn btn-light"
          }}
        ><i className={'fas' + (!row.getIsExpanded() ? " fa-arrow-right" : " fa-arrow-down")}/></button>
      </div>
    ),
    meta: {
      hideInExport: true
    },
    enableGrouping: false,
    aggregatedCell: () => {
      return (
        <div>
        </div>
      );
    },
  },
  {
    id: 'name',
    header: 'Name',
    columns: [
      {
        id: 'firstname',
        accessorKey: 'firstName',
        cell: info => info.getValue(),
        filterFn: strictListFilter as any
      },
      {
        accessorFn: row => row.lastName,
        id: 'lastName',
        cell: info => info.getValue(),
        header: () => <span>Last Name</span>,
        filterFn: strictListFilter as any
      },
      {
        accessorFn: row => `${row.firstName} ${row.lastName}`,
        id: 'fullName',
        header: 'Full Name',
        cell: info => info.getValue(),
        filterFn: strictListFilter as any,
        sortingFn: fuzzySort,
      },
    ],
  },
  {
    id: 'birthDate',
    accessorFn: row=> dayjs(row.birth).startOf('day').toDate(),
    header:"Birth Date",
    cell: info=>dayjs(info.getValue() as Date).format('DD MMM YYYY'),
    filterFn: dateRangeFilter,
    sortingFn: 'datetime',
    meta:{
      filterType: 'date-range-filter'
    },
    aggregatedCell: ()=>null
  },
  {
    id: 'info',
    header: 'Info',
    columns: [
      {
        id: 'age',
        accessorKey: 'age',
        header: () => 'Age',
      },
      {
        id: 'moreinfo',
        header: 'More Info',
        columns: [
          {
            id: 'visits',
            accessorKey: 'visits',
            header: () => <span>Visits</span>,
          },
          {
            id: 'status',
            accessorKey: 'status',
            header: 'Status',
            filterFn: strictListFilter
          },
          {
            id: 'progress',
            accessorKey: 'progress',
            header: 'Profile Progress',
          },
        ],
      },
    ],
  },
]

export const getTableMeta = (
  setData: React.Dispatch<React.SetStateAction<Person[]>>,
  skipAutoResetPageIndex: () => void
) =>
  ({
    updateData: (rowIndex: number, columnId: any, value: any) => {
      // Skip age index reset until after next rerender
      skipAutoResetPageIndex()
      setData(old =>
        old.map((row, index) => {
          if (index !== rowIndex) return row

          return {
            ...old[rowIndex]!,
            [columnId]: value,
          }
        })
      )
    },
  } as TableMeta<any>)

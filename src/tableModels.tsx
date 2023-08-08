/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  ColumnDef,
  FilterFn,
  SortingFn,
  sortingFns,
} from '@tanstack/react-table'
import React from 'react'
import { Person } from './makeData'
import {
  rankItem,
  compareItems,
  RankingInfo,
} from '@tanstack/match-sorter-utils'
import IndeterminateCheckbox from './components/shared/InderterminateCheckbox'

export const fuzzyFilter: FilterFn<any> = (
  row,
  columnId,
  value,
  addMeta
) => {
  // Rank the item
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the ranking info
  addMeta(itemRank)

  // Return if the item should be filtered in/out
  return itemRank.passed
}

export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]! as RankingInfo,
      rowB.columnFiltersMeta[columnId]! as RankingInfo
    )
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir
}

export const strictListFilter : FilterFn<Person> = (row,
  columnId,
  value)=>{
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return (value as string[]).includes(row.getValue(columnId))
}

export type TableMeta = {
  updateData: (rowIndex: number, columnId: string, value: unknown) => void
}

const Cll  = ({ getValue, row: { index }, column: { id }, table }:{
  getValue: ()=>any;
  row: {
      index: any;
  };
  column: {
      id: any;
  };
  table: any;
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const initialValue = getValue()
  // We need to keep and update the state of the cell normally
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [value, setValue] = React.useState(initialValue)

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    (table.options.meta as TableMeta).updateData(index, id, value)
  }

  // If the initialValue is changed external, sync it up with our state
  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    <input
      value={value as string}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
    />
  )
}

// Give our default column cell renderer editing superpowers!
export const defaultColumn: Partial<ColumnDef<Person>> = {
  cell: Cll,
}

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
        filterFn: strictListFilter
      },
      {
        accessorFn: row => row.lastName,
        id: 'lastName',
        cell: info => info.getValue(),
        header: () => <span>Last Name</span>,
        filterFn: strictListFilter
      },
      {
        accessorFn: row => `${row.firstName} ${row.lastName}`,
        id: 'fullName',
        header: 'Full Name',
        cell: info => info.getValue(),
        filterFn: strictListFilter,
        sortingFn: fuzzySort,
      },
    ],
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
    updateData: (rowIndex, columnId, value) => {
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
  } as TableMeta)

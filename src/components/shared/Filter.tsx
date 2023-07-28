import { Column, RowData, Table } from '@tanstack/react-table'
import React, { useRef, useState } from 'react'
import DebouncedInput from './DebouncedInput'
import { Overlay } from 'react-bootstrap'
import { useOutsideAlerter } from '../../hooks/useOutsideAlerter'

type NumberInputProps = {
  columnFilterValue: [number, number]
  getFacetedMinMaxValues: () => [number, number] | undefined
  setFilterValue: (updater: any) => void
}

const NumberInput: React.FC<NumberInputProps> = ({
  columnFilterValue,
  getFacetedMinMaxValues,
  setFilterValue,
}) => {
  const minOpt = getFacetedMinMaxValues()?.[0]
  const min = Number(minOpt ?? '')

  const maxOpt = getFacetedMinMaxValues()?.[1]
  const max = Number(maxOpt)

  return (
    <div>
      <div className="d-flex">
        <DebouncedInput
          type="number"
          min={min}
          max={max}
          value={columnFilterValue?.[0] ?? ''}
          onChange={value =>
            setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min ${minOpt ? `(${min})` : ''}`}
          className="form-control form-control-sm me-2"
        />
        <DebouncedInput
          type="number"
          min={min}
          max={max}
          value={columnFilterValue?.[1] ?? ''}
          onChange={value =>
            setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max ${maxOpt ? `(${max})` : ''}`}
          className="form-control form-control-sm"
        />
      </div>
    </div>
  )
}

type TextInputProps = {
  columnId: string
  columnFilterValue: string[]
  columnSize: number
  setFilterValue: (updater: any) => void
  sortedUniqueValues: any[]
}

const TextInput: React.FC<TextInputProps> = ({
  columnId,
  columnFilterValue,
  columnSize,
  setFilterValue,
  sortedUniqueValues,
}) => {
  const [constraint,setConstraint] = useState('')

  return (
    <React.Fragment>
      <DebouncedInput
        type="text"
        value={constraint ?? ''}
        onChange={value => setConstraint(`${value}`)}
        placeholder={`Search... (${columnSize})`}
        className="form-control form-control-sm"
      />
      <ul className='p-0 mt-2' style={{
        overflow: 'auto',
        maxHeight: '300px'
      }}>
        {sortedUniqueValues.filter(v=>(v as string).toLowerCase().includes(constraint.toLowerCase())).slice(0,20).map((value)=>(
          <li className='py-1' style={{
            listStyle: 'none',
          }}>
            <label className="m-0">
              <input type="checkbox" className='me-2' name="dropdown-group" onChange={(e)=>{
                if(e.target.checked) setFilterValue([...(columnFilterValue ?? []),value])
                else setFilterValue((columnFilterValue ?? []).filter(v=>v!==value).length ? (columnFilterValue ?? []).filter(v=>v!==value) : undefined)
              }} value={value as string} checked={(columnFilterValue ?? []).includes(value as string)}/>
              {value}
            </label>
          </li>
        ))}
      </ul>
      <button className='btn btn-primary btn-wide btn-sm' onClick={()=>{setFilterValue(undefined)}}>Reset</button>
    </React.Fragment>
  )
}

type Props<T extends RowData> = {
  column: Column<T, unknown>
  table: Table<T>
}

export function Filter<T extends RowData>({ column, table }: Props<T>) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()
  const uniqueValues = column.getFacetedUniqueValues()

  const sortedUniqueValues = React.useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      typeof firstValue === 'number'
        ? []
        : Array.from(uniqueValues.keys()).sort(),
    [uniqueValues]
  )

  return typeof firstValue === 'number' ? (
    <NumberInput
      columnFilterValue={columnFilterValue as [number, number]}
      getFacetedMinMaxValues={column.getFacetedMinMaxValues}
      setFilterValue={column.setFilterValue}
    />
  ) : (
    <TextInput
      columnId={column.id}
      columnFilterValue={columnFilterValue as string[]}
      columnSize={uniqueValues.size}
      setFilterValue={column.setFilterValue}
      sortedUniqueValues={sortedUniqueValues}
    />
  )
}

export function FilterOverlay<T extends RowData>(pprops:Props<T>){
  const target = useRef(null)
  const [show,setShow] = useState(false)
  const sref = useRef<HTMLDivElement | null>(null)
  useOutsideAlerter(sref,()=>{
    setShow(false)
  })
  return (
    <>
      <button ref={target} onClick={() => setShow(true)} className="btn btn-secondary btn-sm me-1"><i className='fas fa-filter'/></button>
      <Overlay target={target.current} show={show} placement="bottom-start">
      {({
          placement: _placement,
          arrowProps: _arrowProps,
          show: _show,
          popper: _popper,
          hasDoneInitialMeasure: _hasDoneInitialMeasure,
          ...props
      }) =>{
        return (
          <div
          {...props}
          style={{
              position: "absolute",
              backgroundColor: "white",
              border:'1px solid #ccc',
              borderRadius: 3,
              marginTop: '5px',
              ...props.style,
          }}
          >
            <div className="d-flex flex-column" ref={sref} style={{padding: '8px 10px'}}>
              <span className='h5'>Filtrar</span>
              <Filter column={pprops.column} table={pprops.table}/>
            </div>
          </div>
      )}}</Overlay>
    </>
  )
}

export default Filter

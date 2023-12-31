/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Column, RowData, Table } from '@tanstack/react-table'
import React, { useEffect, useRef, useState } from 'react'
import DebouncedInput from './DebouncedInput'
import { Overlay } from 'react-bootstrap'
import { useOutsideAlerter } from './useOutsideAlerter'
import dayjs from 'dayjs'

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
      <button className='btn btn-primary btn-wide btn-sm w-100 mt-2' onClick={()=>{setFilterValue(undefined)}}>Reset</button>
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

type DaterangeInputProps = {
  columnId: string;
  columnFilterValue: [Date,Date];
  setFilterValue: (updater: any)=> void;
}

const DateRangeInput = (props: DaterangeInputProps)=>{
  const [dateRange,setDateRange] = useState([props.columnFilterValue?.[0] ? dayjs(props.columnFilterValue?.[0]) : undefined, props.columnFilterValue?.[1] ? dayjs(props.columnFilterValue?.[1]) : undefined])

  useEffect(()=>{
    setDateRange([props.columnFilterValue?.[0] ? dayjs(props.columnFilterValue?.[0]) : undefined,props.columnFilterValue?.[1] ? dayjs(props.columnFilterValue?.[1]) : undefined])
  },[props.columnFilterValue])

  return (
    <div>
      <div className="d-flex">
        <DebouncedInput
          type="date"
          onChange={(e)=>{props.setFilterValue([e ? dayjs(e,'YYYY-MM-DD').toDate() : undefined,dateRange[1]?.toDate()])}}
          value={dateRange[0]?.format("YYYY-MM-DD") ?? ""}
          className="form-control form-control-sm"
        />
        <DebouncedInput
          type="date"
          onChange={(e)=>{props.setFilterValue([dateRange[0]?.toDate(), e ? dayjs(e,'YYYY-MM-DD').toDate() : undefined])}}
          value={dateRange[1]?.format("YYYY-MM-DD") ?? ""}
          className="form-control form-control-sm"
        />
      </div>
      <button className='btn btn-primary btn-wide w-100 mt-2' onClick={()=>props.setFilterValue([undefined,undefined])}>Resetear Filtro</button>
    </div>
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

  if((column.columnDef.meta as any)?.['filterType'] === 'date-range-filter') return (
    <DateRangeInput columnFilterValue={columnFilterValue as [Date,Date]} columnId={column.id} setFilterValue={column.setFilterValue}/>
  )

  if(typeof firstValue === 'number') return (
    <NumberInput
      columnFilterValue={columnFilterValue as [number, number]}
      getFacetedMinMaxValues={column.getFacetedMinMaxValues}
      setFilterValue={column.setFilterValue}
    />
  )
  if(typeof firstValue === 'string') return (
    <TextInput
      columnId={column.id}
      columnFilterValue={columnFilterValue as string[]}
      columnSize={uniqueValues.size}
      setFilterValue={column.setFilterValue}
      sortedUniqueValues={sortedUniqueValues}
    />
  )
  return null
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
      <button ref={target} onClick={() => setShow(true)} className={"btn btn-sm me-1" + (pprops.column.getFilterValue() ? " btn-primary" : " btn-secondary")}><i className='fas fa-filter'/></button>
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

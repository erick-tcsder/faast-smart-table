import {
  ColumnOrderState,
} from '@tanstack/react-table'
import { FaastSmartTable, useTable } from './components/FaastSmartTable'
import { columns } from './tableModels'
import { makeData } from './makeData'
import { useCallback, useState } from 'react'
import { TableProfileOrigin, useLocalStorageProfiling } from './components/FaastSmartTable/useLocalStorageProfiling'
import Swal from 'sweetalert2'

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

export const App = () => {
  const [data] = useState(makeData(1000))
  const {
    handleChangeCurrentProfile,
    handleDeleteProfile,
    handleSaveProfile,
    profiles,
    currentProfile
  } = useLocalStorageProfiling({
    tableId: 'sample-table-persons'
  })
  const {
    table,
    exportProfile,
    ...pr
  } = useTable({
    defaultColumns: columns,
    data: data,
    defaultProfile:{
      globalFilter: 'ana',
      columnFilters:[{
        id: 'age',
        value: [20,30]
      }],
      columnSizing: {
        age: 200
      }
    },
    currentProfile,
    profiles
  })

  const handleSaveTableProfile = useCallback(async (isNew:boolean)=>{
    let name = ""
    if(isNew){
      const result = await Swal.fire({
        title: 'Nuevo Perfil',
        text: 'Por favor especifique un nombre para el nuevo perfil',
        input: 'text',
        preConfirm: (id:string) => {
          if(!id){
            Swal.showValidationMessage(
              `Debe llenar el nombre del Perfil`
            )
            throw new Error("msg")
          }
          if(profiles.find(p=>p.id === id)){
            Swal.showValidationMessage(
              `Ya existe un perfil con ese nombre ... no se puede crear de nuevo`
              )
            throw new Error("msg")
          }else{
            return id
          }
        },
      })
      name = (result.value as string) ?? ''
    }else{
      const result = await Swal.fire({
        title: 'Editar Perfil',
        text: 'Esta seguro de querer modificar este Perfil?',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: "Cancelar"
      })
      if(result.value){
        name = currentProfile ?? ''
      }
    }

    if(name){
      await handleSaveProfile(exportProfile().profile,name)
    }
  },[currentProfile, exportProfile, handleSaveProfile, profiles])

  const handleDeleteCurrentTableProfile = useCallback(async()=>{
    if(currentProfile && profiles.find(p=>p.id === currentProfile)?.origin === TableProfileOrigin.USER){
      const result = await Swal.fire({
        title: 'Editar Perfil',
        text: 'Esta seguro de querer ELIMINAR este Perfil?',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: "Cancelar",
        icon:'warning'
      })
      if(result.isConfirmed){
        await handleDeleteProfile(currentProfile)
      }
    }else{
      await Swal.fire("Error","Debe seleccionar un perfil definido por su usuario para poder eliminarlo",'error')
    }
  },[currentProfile, handleDeleteProfile, profiles])

  return (
    <>
      <FaastSmartTable table={table}
      title={"TEST TABLE"}
      allowGlobalFilter
      allowColumnSubcomponents
      allowResizeCols
      allowReorderCols
      allowColumnFilter
      allowColumnPinning
      allowColumnSorting
      allowColumnGrouping
      allowHandleVisibility
      allowNativeExcelDownload
      grouping={pr.grouping}
      setGrouping={pr.setGrouping}
      globalFilter={pr.globalFilter}
      setGlobalFilter={pr.setGlobalFilter}
      customRender={(row)=><pre>{JSON.stringify(row,null,2)}</pre>}
      
      allowProfiling
      exportProfile={exportProfile}
      handleChangeCurrentProfile={handleChangeCurrentProfile}
      handleDeleteProfile={handleDeleteCurrentTableProfile}
      handleSaveProfile={handleSaveTableProfile}
      currentProfile={currentProfile}
      profiles={profiles}
      />
    </>
  )
}

export default App

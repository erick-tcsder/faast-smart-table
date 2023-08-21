/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-unsafe-optional-chaining */
import { useCallback, useEffect, useState } from "react";
import { TableProfile } from "."

export enum TableProfileOrigin {
    USER = 'user',
    DEFAULT = "default"
}

export type TableProfileExtended = {
    id: string;
    profile: TableProfile,
    origin?: TableProfileOrigin
}

export type UseProfilingHook = (params:{
    defaultProfiles?: Omit<TableProfileExtended,'origin'>[],
    tableId: string
})=>{
    profiles: TableProfileExtended[],
    handleSaveProfile: (profile: TableProfile,id:string)=>(Promise<void> | void),
    handleDeleteProfile: (id:string)=>(Promise<void> | void),
    currentProfile?: string;
    handleChangeCurrentProfile: (id:string)=>(Promise<void>|void)
}

export const useLocalStorageProfiling : UseProfilingHook = (params)=>{
    const [profiles,setProfiles] = useState<TableProfileExtended[]>(params?.defaultProfiles?.length ? [...params?.defaultProfiles?.map(i=>({...i,origin: TableProfileOrigin.DEFAULT }))] : [])
    const [currentProfile,setCurrentProfile] = useState<string>(JSON.parse(localStorage.getItem(params.tableId) ?? '""')?.['currentProfile'])
    const handleSaveProfile = useCallback((profile: TableProfile,id:string)=>{
        const prof = profiles.find(p=>p.id===id)
        if(prof?.origin === TableProfileOrigin.DEFAULT){
            throw new Error("unable to edit profile")
        }
        const newArr = []
        if(!prof){
            setProfiles(o=>([...o,{
                id,
                profile,
                origin: TableProfileOrigin.USER
            }]))
            setCurrentProfile(id)
            newArr.push(...profiles.filter(p=>p.origin === TableProfileOrigin.USER),{
                id,
                profile,
                origin: TableProfileOrigin.USER
            })
        }else{
            setProfiles(o=>([...o.filter(oi=>oi.id!==id),{
                id,
                profile,
                origin: TableProfileOrigin.USER
            }]))
            setCurrentProfile(id)
            newArr.push(...profiles.filter(p=>p.origin === TableProfileOrigin.USER).filter(p=>p.id !== id),{
                id,
                profile,
                origin: TableProfileOrigin.USER
            })
        }
        localStorage.setItem(params.tableId,JSON.stringify({
            currentProfile: id,
            profiles: newArr
        }))
    },[params.tableId, profiles])

    const handleDeleteProfile = useCallback((id:string)=>{
        const prof = profiles.find(p=>p.id===id)
        if(!prof || prof?.origin === TableProfileOrigin.DEFAULT){
            throw new Error("unable to delete profile")
        }
        const newArr = [...profiles.filter(p=>p.origin === TableProfileOrigin.USER).filter(p=>p.id !== id)]
        setProfiles(o=>([...o.filter(oi=>oi.id!==id)]))
        localStorage.setItem(params.tableId,JSON.stringify({
            currentProfile: (newArr?.[0]?.id) ?? '',
            profiles: newArr
        }))
    },[params.tableId, profiles])

    useEffect(()=>{
        setProfiles([...(params?.defaultProfiles ?? []),...(JSON.parse(localStorage.getItem(params.tableId) ?? '""')?.['profiles'] as TableProfileExtended[] ?? [])])
    },[params?.defaultProfiles, params.tableId])

    useEffect(()=>{
        localStorage.setItem(params.tableId,JSON.stringify({
            currentProfile: currentProfile,
            profiles: JSON.parse(localStorage.getItem(params.tableId) ?? '""')?.profiles
        }))
    },[currentProfile])

    return {
        profiles,
        handleSaveProfile,
        currentProfile,
        handleDeleteProfile,
        handleChangeCurrentProfile: setCurrentProfile
    }
}
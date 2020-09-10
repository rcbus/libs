/* ########## storageBackend: ##########

Funciona de forma muito parecida do localStorage do frontend. Porém é para uso exclusivo no backend.

########## storageBackend: ########## */

import { LocalStorage } from 'node-localstorage'

const localStorage = new LocalStorage('./public/session')

export function getSession(key,pagename){
    try{
        if(typeof pagename === 'undefined'){
            pagename = process.env.tokenApi
        }

        if(localStorage.getItem(pagename + "-" + key).length==0){
            return false
        }else{
            const now = new Date()
            const lifetime = localStorage.getItem("lifetime-" + pagename + "-" + key)    
            if(lifetime>0 && lifetime<=now.getTime()){
                localStorage.removeItem("lifetime-" + pagename + "-" + key)
                localStorage.removeItem(pagename + "-" + key)
                return false
            }else{
                return JSON.parse(localStorage.getItem(pagename + "-" + key))
            }
        }
    }catch(e){
        return false
    }
}

export function setSession(key,data,pagename,lifetime){
    try{
        if(typeof pagename === 'undefined'){
            pagename = process.env.tokenApi
        }
        if(typeof lifetime !== 'undefined'){
            const now = new Date()
            localStorage.setItem("lifetime-" + pagename + "-" + key,now.getTime() + lifetime)    
        }else{
            localStorage.setItem("lifetime-" + pagename + "-" + key,0)    
        }
        localStorage.setItem(pagename + "-" + key,JSON.stringify(data))
        return true
    }catch(e){
        return false
    }
}

export function unSetSession(key,pagename){
    try{
        if(typeof pagename === 'undefined'){
            pagename = 'app'
        }

        if(localStorage.getItem(pagename + "-" + key).length==0){
            return false
        }else{
            localStorage.removeItem("lifetime-" + pagename + "-" + key)
            localStorage.removeItem(pagename + "-" + key)
            return true
        }
    }catch(e){
        return false
    }
}
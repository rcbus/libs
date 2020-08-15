import { strlen, verifyVariable } from '../libs/functions'
import { openLoading,closeLoading } from '../components/loading'

export async function api(host,token,data,callback) {
    const res = await fetch(host,{
        method: 'post',
        body: JSON.stringify({
            token,
            data
        })
    })
    const returnData = await res.json();
    if(returnData){
        if(callback){
            callback(returnData)
        }else{
            return true
        }
    }
}

export function getHostApi(){
    return process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/'
}

export function getListData(pathApi,collection,config,callbackSetList,callbackSetConfig,idRef,condition,loading){
    if(verifyVariable(pathApi) && verifyVariable(collection)){
        var data = {}

        data.condition = {}
        data.config = config
        data.search = ''

        if(loading !== undefined){
            openLoading({count:[1,5,60]})
        }        
      
        if(verifyVariable(condition)>0){
            data.condition = condition
        }

        if(verifyVariable(data.condition.status)==0){
            data.condition.status = 1
        }

        if(verifyVariable(idRef)>0){
            data.condition.idRef = idRef
        }

        api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + pathApi,process.env.tokenApi,data,(res) => {
            if(res.res=="error"){
                openMsg({text:res.error,type:-1})
            }else{
                if(callbackSetConfig){
                    callbackSetConfig(res.data.config)
                }
                if(callbackSetList){
                    callbackSetList(res.data.data)
                }
            }
            if(loading !== undefined){
                closeLoading()
            }
        })
    }
}

export async function getListSelect(pathApi,toSelect,callbackSetList,condition,loading){
    var data = {}
    if(condition === undefined){
        data.condition = {status:1}
    }else{
        data.condition = condition
    }
    data.config = ''
    data.search = ''
    data.toSelect = toSelect
    if(loading !== undefined){
        openLoading({count:[1,5,60]})
    }
    api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + pathApi,process.env.tokenApi,data,(res) => {
        if(res.res=="error"){
            openMsg({text:res.error,type:-1})
        }else{
            callbackSetList(res.data.data)
        }
        if(loading !== undefined){
            closeLoading()
        }
    })
}

export function result(code,json,res,resolve){
    res.statusCode = code
    res.json(json)
    resolve()
}

export function security(req) {
    if(req.body.length==0){
        console.log('> error: no body')
        return { res: 'error',error: 'no body' }
    }else{
        const body = JSON.parse(req.body)
        if(typeof body.token === 'undefined'){
            console.log('> error: access denied (1)')
            return { res: 'error',error: 'access denied (1)' }
        }else if(body.token.length==0){
            console.log('> error: access denied (2)')
            return { res: 'error',error: 'access denied (2)' }
        }else if(body.token!=process.env.tokenApi){
            console.log('> error: access denied (3)')
            return { res: 'error',error: 'access denied (3)' }
        }else{
            console.log('> [api]: access allowed')
            return { res: 'success',data: body.data }
        }
    }
}
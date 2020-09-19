/*
Para usar o mongodb é necessário criar previamente o banco de dados e o usuario
com privilégios para leitura e escrita no mesmo conforme instruções abaixo:

use dbName

db.createUser({user:"name",pwd:"senha123",roles:[{role:"readWrite",db:"dbName"}]})
*/

import { MongoClient } from 'mongodb'
import { zeroLeft,getSession,strlen,setSubState,diacriticSensitiveRegex,count,strupper } from '../libs/functions'
import { result } from '../libs/api'

export async function con(callback){
    MongoClient.connect('mongodb://' + process.env.dbUser + ':' + process.env.dbPass + '@' + process.env.dbHost + ':' + process.env.dbPort + '/' + process.env.dbName,{ useUnifiedTopology: true }, (error, client) => {
        if(error){
            client = false
            console.log('> error: ' + error)
        }else{
            error = false
            console.log('> [mongodb]: connected')
        }
        callback({error,client})
    })
}

export function crudab(req,res,resolve,reject,collection,verify,msgVerify,data,sort,limit,processing,collectionConfig,callback){  
    if(collectionConfig === undefined){ collectionConfig = collection }
    
    if(verifyCrudad(data)=='read'){
        if(strlen(data.search)>0 && strlen(data.config)>0){
            var searchTemp = search(data.search,data.config)
            data.condition = setSubState(data.condition,{$or:searchTemp})
        }

        sel(collection,data.condition,{ahnes:false},(resultMongo) => {
            if(resultMongo.error){
                if(!callback){
                    result(200,{res:'error',error:resultMongo.error},res,resolve)
                }else{
                    callback({res:'error',error:resultMongo.error})
                }
            }else{
                resultMongo.data = exeProcessing(processing,resultMongo.data)
                if(data.toSelect !== undefined){
                    if(data.toSelect.value !== undefined){
                        if(data.toSelect.text !== undefined){
                            var textArray = []
                            if(typeof data.toSelect.text === 'string'){
                                textArray.push(data.toSelect.text)
                            }else{
                                textArray = data.toSelect.text
                            }
                            resultMongo.data = resultMongo.data.map(mongoData => {
                                var newText = ''
                                textArray.map(text => {
                                    if(mongoData[text] !== undefined){
                                        if(strlen(newText)>0){
                                            newText += ' - '
                                        }
                                        
                                        newText += mongoData[text]
                                    }
                                })
                                return {value:mongoData[data.toSelect.value],text:newText}
                            })
                        }
                    }
                }

                var resultData = {
                    data:resultMongo.data
                }
                sel('config',{collection:collectionConfig},{branch:false,user:false,date:false,dateModification:false,historic:false},(resultMongo) => {
                    if(resultMongo.error){
                        if(!callback){
                            result(200,{res:'error',error:resultMongo.error},res,resolve)
                        }else{
                            callback({res:'error',error:resultMongo.error})
                        }
                    }else{
                        resultData.config = resultMongo.data                        
                        if(!callback){
                            result(200,{ res: 'success',data: resultData },res,resolve)
                        }else{
                            callback({ res: 'success',data: resultData })
                        }
                    }
                })
            }
        },sort,limit)
    }else{   
        sel(collection,verify,{},(resultMongo) => {
            if(resultMongo.error){
                if(!callback){
                    result(200,{res:'error',error:resultMongo.error},res,resolve)
                }else{
                    callback({res:'error',error:resultMongo.error})
                }
            }else if(strlen(resultMongo.data)>0 && (data.status==1 || strlen(data._id)==0) && count(Object.keys(verify))>0){
                if(!callback){
                    result(200,{res:'error',error:msgVerify},res,resolve)
                }else{
                    callback({res:'error',error:msgVerify})
                }
            }else{
                if(strlen(data._id)==0){
                    if(strlen(data.status) == 0){
                        data.status = 1
                    }
                    ins(collection,data,(resultMongo) => {
                        if(resultMongo.error){
                            if(!callback){
                                result(200,{res:'error',error:resultMongo.error},res,resolve)
                            }else{
                                callback({res:'error',error:resultMongo.error})
                            }
                        }else{
                            resultMongo.data = exeProcessing(processing,resultMongo.data)
                            if(!callback){
                                result(200,{ res: 'success',data:resultMongo.data },res,resolve)
                            }else{
                                callback({ res: 'success',data:resultMongo.data })
                            }
                        }
                    })
                }else{
                    upd(collection,data,(resultMongo) => {
                        if(resultMongo.error){
                            if(!callback){
                                result(200,{res:'error',error:resultMongo.error},res,resolve)
                            }else{
                                callback({res:'error',error:resultMongo.error})
                            }
                        }else{
                            resultMongo.data = exeProcessing(processing,resultMongo.data)
                            if(!callback){
                                result(200,{ res:'success',data:resultMongo.data },res,resolve)
                            }else{
                                callback({ res:'success',data:resultMongo.data })
                            }
                        }
                    })
                }
            }
        })
    }
}

export async function getNextId(collection,callback,add,randomId){
    if(typeof add === 'undefined'){
        add = 1
    }

    con((result) => {
        if(result.error){
            result.client.close()
            result.client = false
            callback({error:result.error})
        }else{
            result.error = false
            const client = result.client
            const db = client.db(process.env.dbName).collection('counters')

            if(typeof randomId === 'undefined'){
                db.find({_id:collection}).count().then(count => {
                    if(count==0){
                        db.insertOne({_id:collection,next:0},(error,result) => {
                            if(error){
                                console.log('> error: ' + error)
                                client.close()
                                callback({error})
                            }else{
                                db.findOneAndUpdate({_id:collection},{$inc:{next:add}},(error,result) => {
                                    if(error){
                                        console.log('> error: ' + error)
                                        client.close()
                                        callback({error})
                                    }else{
                                        error = false
                                        console.log('> [mongodb]: *newId:' + (result.value.next + add))
                                        callback({error,client,newId:(result.value.next + add)})
                                    }
                                })
                            }
                        })
                    }else{
                        db.findOneAndUpdate({_id:collection},{$inc:{next:add}},(error,result) => {
                            if(error){
                                console.log('> error: ' + error)
                                client.close()
                                callback({error})
                            }else{
                                error = false
                                console.log('> [mongodb]: newId:' + (result.value.next + add))
                                callback({error,client,newId:(result.value.next + add)})
                            }
                        })
                    }
                })
            }else{
                console.log('> [mongodb]: newId:random')
                callback({error:false,client,newId:'random'})
            }
        }
    })
}

export async function ins(collection,data,callback,randomId,counters){
    if(counters === undefined){
        counters = collection
    }
    getNextId(counters,(result) => {
        if(result.error){
            result.client = false
            callback({error:result.error})
        }else{
            const client = result.client
            const db = client.db(process.env.dbName).collection(collection)
            const now = new Date()

            result.error = false
            if(result.newId!='random'){
                data._id = result.newId
            }

            security(data,client,callback,() => {
                data.branch = (typeof data.branch !== 'undefined' ? data.branch : 1)
                data.branchName = (typeof data.branchName !== 'undefined' ? data.branchName : '')
                data.user = (typeof data.user !== 'undefined' ? data.user : 1)
                data.userName = (typeof data.userName !== 'undefined' ? ("(" + data.user + ") " + data.userName) : '(1) ADMIN')
                data.userUpdate = (typeof data.userUpdate !== 'undefined' ? data.userUpdate : 1)
                data.userNameUpdate = (typeof data.userNameUpdate !== 'undefined' ? ("(" + data.userUpdate + ") " + data.userNameUpdate) : '(1) ADMIN')
                data.date = now.getTime(),
                data.dateModification = now.getTime(),
                data.historic = '# CRIADO POR ' + data.userName + ' EM ' + zeroLeft(now.getDate(),2) + '/' + zeroLeft(now.getMonth()+1,2) + '/' + now.getFullYear() + ' ' + zeroLeft(now.getHours(),2) + ':' + zeroLeft(now.getMinutes(),2) + ':' + zeroLeft(now.getSeconds(),2)                 
                data.status = (strlen(data.status)>0 ? data.status : 1),
                delete data.token
                delete data.access

                db.insertOne(data,(error,result) => {
                    if(error){
                        console.log('> error: ' + error)
                        client.close()
                        callback({error})
                    }else{
                        error = false
                        console.log('> [mongodb]: inserted successfully')
                        db.find(data).limit(1).sort({date:-1}).toArray((error,result) => {
                            if(error){
                                console.log('> error: ' + error)
                                client.close()
                                callback({error})
                            }else{
                                error = false
                                client.close()
                                callback({error,data:result})
                            }
                        })
                    }
                })
            })
        }
    },undefined,randomId)
}

export async function insArray(collection,data,callback,withoutToken){
    if(Array.isArray(data)===false){
        result.client = false
        console.log('> error: data is not array')
        callback({error:'data is not array'})
    }else{
        getNextId(collection,(result) => {
            if(result.error){
                result.client = false
                callback({error:result.error})
            }else{
                const client = result.client
                const db = client.db(process.env.dbName).collection(collection)
                const now = new Date()

                result.error = false

                var startId = result.newId - (data.length - 1)
                
                security(data,client,callback,() => {
                    data.map((v,k) => {
                        data[k]._id = startId
                        data[k].branch = (typeof data[k].branch !== 'undefined' ? data[k].branch : 1)
                        data[k].branchName = (typeof data[k].branchName !== 'undefined' ? data[k].branchName : '')
                        data[k].user = (typeof data[k].user !== 'undefined' ? data[k].user : 1)
                        data[k].userName = (typeof data[k].userName !== 'undefined' ? ("(" + data[k].user + ") " + data[k].userName) : '(1) ADMIN')
                        data[k].userUpdate = (typeof data[k].userUpdate !== 'undefined' ? data[k].userUpdate : 1)
                        data[k].userNameUpdate = (typeof data[k].userNameUpdate !== 'undefined' ? ("(" + data[k].userUpdate + ") " + data[k].userNameUpdate) : '(1) ADMIN')
                        data[k].date = (typeof data[k].date !== 'undefined' ? data[k].date : now.getTime()),
                        data[k].dateModification = (typeof data[k].dateModification !== 'undefined' ? data[k].dateModification : now.getTime()),
                        data[k].historic = (typeof data[k].historic !== 'undefined' ? data[k].historic : '# CRIADO POR ' + data[k].userName + ' EM ' + zeroLeft(now.getDate(),2) + '/' + zeroLeft(now.getMonth()+1,2) + '/' + now.getFullYear() + ' ' + zeroLeft(now.getHours(),2) + ':' + zeroLeft(now.getMinutes(),2) + ':' + zeroLeft(now.getSeconds(),2))                 
                        data[k].status = (strlen(data[k].status)>0 ? data[k].status : 1)
                        startId = startId + 1

                        delete data[k].access
                        delete data[k].token
                    })

                    db.insertMany(data,(error,result) => {
                        if(error){
                            console.log('> error: ' + error)
                            client.close()
                            callback({error})
                        }else{
                            error = false
                            console.log('> [mongodb]: inserted array successfully')
                            client.close()
                            callback({error,data:result})
                        }
                    })
                },withoutToken)
            }
        },data.length)
    }
}

export function exeProcessing(processing,data){
    if(processing !== undefined){
        if(count(processing)>0){
            processing.map(p => {
                if(p.column !== undefined){
                    if(p.callback !== undefined){
                        Object.keys(data).map(k => {
                            if(data[k][p.column] !== undefined){
                                data[k][p.column] = p.callback(data[k][p.column])
                            }
                        })
                    }
                }
            })
        }
    }
    return data
}

export function search(search,config){
    var searchTemp = []
    if(strlen(search)>0 && count(config)>0){
        Object.values(config).map(v => {
            if(v.searchable=='true'){
                if(search.indexOf('*#')!=-1){
                    var regexArray = []
                    regexArray = search.split('*#')
                    regexArray.map(regexTemp => {
                        var regex = new RegExp(diacriticSensitiveRegex(regexTemp),'i');
                        searchTemp.push({[v.column]:{$regex:regex}})
                    })
                }else if(search.indexOf('*')!=-1){
                    var regexArray = []
                    var regexConcat = ''

                    regexArray = search.split('*')
                    regexArray.map(regexTemp => {
                        if(strlen(regexConcat)>0){
                            regexConcat += '.*'
                        }
                        regexConcat += regexTemp
                    })

                    var regex = new RegExp(diacriticSensitiveRegex(regexConcat),'i');
                    searchTemp.push({[v.column]:{$regex:regex}})
                }else{
                    var regex = new RegExp(diacriticSensitiveRegex(search),'i');
                    searchTemp.push({[v.column]:{$regex:regex}})
                }
            }
        })
    }
    return searchTemp
}

export async function security(data,client,callback,callbackSecurity,withoutToken){
    var token = undefined
    var user = undefined
    var access = undefined
    if(Array.isArray(data)){
        token = data[0].token
        user = data[0].userUpdate
        access = data[0].access
    }else{
        token = data.token
        user = data.userUpdate
        access = data.access
    }
    if(process.env.security===true && withoutToken === undefined){
        if(token === undefined){
            var error = 'Falha de segurança(1)!'
            console.log('> error: ' + error)
            client.close()
            callback({error:(error + '<br>Fale com o administrador do sistema.')})
        }else{
            if(strupper(access)!='ADMIN'){
                await sel('cadastro_pessoa',{_id:user,token:token},{_id:true},(resultMongo) => {
                    if(resultMongo.error){
                        var error = 'Falha de segurança(2)!'
                        console.log('> error: ' + error)
                        client.close()
                        callback({error:(error + '<br>Fale com o administrador do sistema.')})
                    }else if(count(resultMongo.data)==0){
                        var error = 'Falha de segurança(3)!'
                        console.log('> error: ' + error)
                        client.close()
                        callback({error:(error + '<br>Fale com o administrador do sistema.')})
                    }else{
                        callbackSecurity()
                    }
                })
            }else{
                callbackSecurity()
            }
        }
    }else{
        callbackSecurity()
    }
}

export async function sel(collection,data,projection,callback,sort,limit){
    if(typeof limit === 'undefined'){ limit = 100 }
    if(typeof sort === 'undefined'){ sort = {} }
    con((result) => {
        if(result.error){
            result.client = false
            callback({error:result.error})
        }else{
            const client = result.client
            const db = client.db(process.env.dbName).collection(collection)

            result.error = false
            db.find(data).project(projection).limit(limit).sort(sort).collation({locale: "en_US", numericOrdering: true}).toArray((error,result) => {
                if(error){
                    console.log('> error: ' + error)
                    client.close()
                    callback({error})
                }else{
                    error = false
                    console.log('> [mongodb]: successfully selected')
                    client.close()
                    callback({error,data:result})
                }
            })
        }
    })
}

export async function upd(collection,data,callback,withoutHistoric,withoutToken){
    if(typeof data._id === 'undefined'){
        console.log('> error: _id undefined')
        callback({error:'_id undefined'})
    }else if(data._id.length == 0){
        console.log('> error: _id null')
        callback({error:'_id null'})
    }else{
        con((result) => {
            if(result.error){
                result.client = false
                callback({error:result.error})
            }else{
                const client = result.client
                const db = client.db(process.env.dbName).collection(collection)
                const now = new Date()

                result.error = false

                db.find({_id:data._id}).toArray((error,result) => {
                    if(error){
                        console.log('> error: ' + error)
                        client.close()
                        callback({error})
                    }else{
                        const dataBefore = result[0]

                        error = false

                        var modified = ""
                        Object.keys(data).map((key) => {
                            if(key!='historic' && key!='dateModification' && key!='access' && key!='token'){
                                if(typeof dataBefore[key] === 'undefined'){
                                    if(modified.length>0){
                                        modified = modified + ','
                                    }
                                    modified = modified + '*' + key + '=[] ' 
                                }else if(dataBefore[key]!=data[key]){
                                    if(modified.length>0){
                                        modified = modified + ','
                                    }
                                    modified = modified + key + '=[' + dataBefore[key] + '] ' 
                                }
                            }
                        })

                        if(modified.length==0){
                            modified = ' - NENHUMA ALTERAÇÃO'
                        }else{
                            modified = ' - ANTES DAS ALTERAÇÕES: ' + modified
                        }

                        if(typeof withoutHistoric !== 'undefined'){
                            modified = "";
                        }

                        security(data,client,callback,() => {
                            data.user = (typeof data.user !== 'undefined' ? data.user : 1)
                            data.userName = (typeof data.userName !== 'undefined' ? data.userName : 'ADMIN')
                            data.userUpdate = (typeof data.userUpdate !== 'undefined' ? data.userUpdate : 1)
                            data.userNameUpdate = (typeof data.userNameUpdate !== 'undefined' ? data.userNameUpdate : 'ADMIN')
                            data.dateModification = now.getTime()
                            data.historic = '# MODIFICADO POR (' + data.userUpdate + ') ' + data.userNameUpdate + ' EM ' + zeroLeft(now.getDate(),2) + '/' + zeroLeft(now.getMonth()+1,2) + '/' + now.getFullYear() + ' ' + zeroLeft(now.getHours(),2) + ':' + zeroLeft(now.getMinutes(),2) + ':' + zeroLeft(now.getSeconds(),2) + modified + dataBefore.historic                 

                            if(withoutToken === undefined){
                                delete data.token
                                delete data.access
                            }

                            db.updateOne({_id:data._id},{$set:data},null,(error,result) => {
                                if(error){
                                    console.log('> error: ' + error)
                                    client.close()
                                    callback({error})
                                }else{
                                    error = false
                                    console.log('> [mongodb]: updated successfully')
                                    client.close()
                                    callback({error,data:[data]})
                                }
                            })
                        },withoutToken)
                    }
                })
            }
        })
    }
}

export function verifyCrudad(data){
    if(typeof data.condition !== 'undefined' && typeof data.config !== 'undefined' && typeof data.search !== 'undefined'){
        return 'read'
    }else if(strlen(data._id)==0){
        return 'create'
    }else{
        return 'update'
    }
}
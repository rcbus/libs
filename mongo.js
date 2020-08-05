/*
Para usar o mongodb é necessário criar previamente o banco de dados e o usuario
com privilégios para leitura e escrita no mesmo conforme instruções abaixo:

use dbName

db.createUser({user:"name",pwd:"senha123",roles:[{role:"readWrite",db:"dbName"}]})
*/

import { MongoClient } from 'mongodb'
import { zeroLeft,getSession,strlen,setSubState,diacriticSensitiveRegex,count } from '../libs/functions'
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

export function crudab(req,res,resolve,reject,collection,verify,msgVerify,data,sort,limit,processing){  
    if(verifyCrudad(data)=='read'){
        if(strlen(data.search)>0 && strlen(data.config)>0){
            var searchTemp = []
            Object.values(data.config).map(v => {
                if(v.searchable=='true'){
                    var regex = new RegExp(diacriticSensitiveRegex(data.search),'i');
                    searchTemp.push({[v.column]:{$regex:regex}})
                }
            })
            data.condition = setSubState(data.condition,{$or:searchTemp})
        }

        sel(collection,data.condition,{},(resultMongo) => {
            if(resultMongo.error){
                result(200,{res:'error',error:resultMongo.error},res,resolve)
            }else{
                resultMongo.data = exeProcessing(processing,resultMongo.data)
                var resultData = {
                    data:resultMongo.data
                }
                sel('config',{collection},{branch:false,user:false,date:false,dateModification:false,historic:false},(resultMongo) => {
                    if(resultMongo.error){
                        result(200,{res:'error',error:resultMongo.error},res,resolve)
                    }else{
                        resultData.config = resultMongo.data
                        result(200,{ res: 'success',data: resultData },res,resolve)
                    }
                })
            }
        },sort,limit)
    }else{   
        sel(collection,verify,{},(resultMongo) => {
            if(resultMongo.error){
                result(200,{res:'error',error:resultMongo.error},res,resolve)
            }else if(strlen(resultMongo.data)>0 && (data.status==1 || strlen(data._id)==0)){
                result(200,{res:'error',error:msgVerify},res,resolve)
            }else{
                if(strlen(data._id)==0){
                    data.status = 1
                    ins(collection,data,(resultMongo) => {
                        if(resultMongo.error){
                            result(200,{res:'error',error:resultMongo.error},res,resolve)
                        }else{
                            resultMongo.data = exeProcessing(processing,resultMongo.data)
                            result(200,{ res: 'success',data:resultMongo.data },res,resolve)
                        }
                    })
                }else{
                    upd(collection,data,(resultMongo) => {
                        if(resultMongo.error){
                            result(200,{res:'error',error:resultMongo.error},res,resolve)
                        }else{
                            resultMongo.data = exeProcessing(processing,resultMongo.data)
                            result(200,{ res:'success',data:resultMongo.data },res,resolve)
                        }
                    })
                }
            }
        })
    }
}

export function getNextId(collection,callback,add,randomId){
    if(typeof add === 'undefined'){
        add = 1
    }

    con((result) => {
        if(result.error){
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
                                callback({error})
                            }else{
                                db.findOneAndUpdate({_id:collection},{$inc:{next:add}},(error,result) => {
                                    if(error){
                                        console.log('> error: ' + error)
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

export function ins(collection,data,callback,randomId){
    getNextId(collection,(result) => {
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
            data.branch = (typeof data.branch !== 'undefined' ? data.branch : 1)
            data.branchName = (typeof data.branchName !== 'undefined' ? data.branchName : '')
            data.user = (typeof data.user !== 'undefined' ? data.user : 1)
            data.userName = (typeof data.userName !== 'undefined' ? ("(" + data.user + ") " + data.userName) : '')
            data.date = now.getTime(),
            data.dateModification = now.getTime(),
            data.historic = '# CRIADO POR ' + data.userName + ' EM ' + zeroLeft(now.getDate(),2) + '/' + zeroLeft(now.getMonth()+1,2) + '/' + now.getFullYear() + ' ' + zeroLeft(now.getHours(),2) + ':' + zeroLeft(now.getMinutes(),2) + ':' + zeroLeft(now.getSeconds(),2)                 

            db.insertOne(data,(error,result) => {
                if(error){
                    console.log('> error: ' + error)
                    callback({error})
                }else{
                    error = false
                    console.log('> [mongodb]: inserted successfully')
                    db.find(data).limit(1).sort({date:-1}).toArray((error,result) => {
                        if(error){
                            console.log('> error: ' + error)
                            callback({error})
                        }else{
                            error = false
                            callback({error,data:result})
                        }
                    })
                }
            })
        }
    },undefined,randomId)
}

export function insArray(collection,data,callback){
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

                data.map(v => {
                    v._id = startId
                    v.branch = (typeof v.branch !== 'undefined' ? v.branch : 1)
                    v.branchName = (typeof v.branchName !== 'undefined' ? v.branchName : '')
                    v.user = (typeof v.user !== 'undefined' ? v.user : 1)
                    v.userName = (typeof v.userName !== 'undefined' ? ("(" + v.user + ") " + v.userName) : '')
                    v.date = (typeof v.date !== 'undefined' ? v.date : now.getTime()),
                    v.dateModification = (typeof v.dateModification !== 'undefined' ? v.dateModification : now.getTime()),
                    v.historic = (typeof v.historic !== 'undefined' ? v.historic : '# CRIADO POR ' + v.userName + ' EM ' + zeroLeft(now.getDate(),2) + '/' + zeroLeft(now.getMonth()+1,2) + '/' + now.getFullYear() + ' ' + zeroLeft(now.getHours(),2) + ':' + zeroLeft(now.getMinutes(),2) + ':' + zeroLeft(now.getSeconds(),2))                 
                    startId = startId + 1
                })

                db.insertMany(data,(error,result) => {
                    if(error){
                        console.log('> error: ' + error)
                        callback({error})
                    }else{
                        error = false
                        console.log('> [mongodb]: inserted array successfully')
                        callback({error,data:result})
                    }
                })
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

export function sel(collection,data,projection,callback,sort,limit){
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
            db.find(data,projection).limit(limit).sort(sort).collation({locale: "en_US", numericOrdering: true}).toArray((error,result) => {
                if(error){
                    console.log('> error: ' + error)
                    callback({error})
                }else{
                    error = false
                    console.log('> [mongodb]: successfully selected')
                    callback({error,data:result})
                }
            })
        }
    })
}

export function upd(collection,data,callback,withoutHistoric){
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
                        callback({error})
                    }else{
                        const dataBefore = result[0]

                        error = false

                        var modified = ""
                        Object.keys(data).map((key) => {
                            if(key!='historic' && key!='dateModification'){
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

                        data.dateModification = now.getTime(),
                        data.historic = '# MODIFICADO POR (1) ADMIN EM ' + zeroLeft(now.getDate(),2) + '/' + zeroLeft(now.getMonth()+1,2) + '/' + now.getFullYear() + ' ' + zeroLeft(now.getHours(),2) + ':' + zeroLeft(now.getMinutes(),2) + ':' + zeroLeft(now.getSeconds(),2) + modified + dataBefore.historic                 

                        db.updateOne({_id:data._id},{$set:data},null,(error,result) => {
                            if(error){
                                console.log('> error: ' + error)
                                callback({error})
                            }else{
                                error = false
                                console.log('> [mongodb]: updated successfully')
                                callback({error,data:[data]})
                            }
                        })
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
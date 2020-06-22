/*
Para usar o mongodb é necessário criar previamente o banco de dados e o usuario
com privilégios para leitura e escrita no mesmo conforme instruções abaixo:

use dbName

db.createUser({user:"name",pwd:"senha123",roles:[{role:"readWrite",db:"dbName"}]})
*/

import { MongoClient } from 'mongodb'
import { zeroLeft } from '../libs/functions'

export async function con(callback){
    MongoClient.connect('mongodb://' + process.env.dbUser + ':' + process.env.dbPass + '@' + process.env.dbHost + ':' + process.env.dbPort + '/' + process.env.dbName, (error, client) => {
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

export function ins(collection,data,callback){
    getNextId(collection,(result) => {
        if(result.error){
            result.client = false
            callback({error:result.error})
        }else{
            const client = result.client
            const db = client.db(process.env.dbName).collection(collection)
            const now = new Date()

            result.error = false
            data._id = result.newId
            data.branch = 1
            data.user = 1
            data.date = now.getTime(),
            data.dateModification = now.getTime(),
            data.historic = '# CRIADO POR (1) ADMIN EM ' + zeroLeft(now.getDate(),2) + '/' + zeroLeft(now.getMonth()+1,2) + '/' + now.getFullYear() + ' ' + zeroLeft(now.getHours(),2) + ':' + zeroLeft(now.getMinutes(),2) + ':' + zeroLeft(now.getSeconds(),2)                 

            db.insertOne(data,(error,result) => {
                if(error){
                    console.log('> error: ' + error)
                    callback({error})
                }else{
                    error = false
                    console.log('> [mongodb]: inserted successfully')
                    db.find({_id:data._id}).toArray((error,result) => {
                        if(error){
                            console.log('> error: ' + error)
                            callback({error})
                        }else{
                            error = false
                            callback({error,data})
                        }
                    })
                }
            })
        }
    })
}

export function getNextId(collection,callback){
    con((result) => {
        if(result.error){
            result.client = false
            callback({error:result.error})
        }else{
            result.error = false
            const client = result.client
            const db = client.db(process.env.dbName).collection('counters')
            db.find({_id:collection}).count().then(count => {
                if(count==0){
                    db.insertOne({_id:collection,next:1},(error,result) => {
                        if(error){
                            console.log('> error: ' + error)
                            callback({error})
                        }else{
                            db.findOneAndUpdate({_id:collection},{$inc:{next:1}},(error,result) => {
                                if(error){
                                    console.log('> error: ' + error)
                                    callback({error})
                                }else{
                                    error = false
                                    console.log('> [mongodb]: *newId:' + result.value.next)
                                    callback({error,client,newId:result.value.next})
                                }
                            })
                        }
                    })
                }else{
                    db.findOneAndUpdate({_id:collection},{$inc:{next:1}},(error,result) => {
                        if(error){
                            console.log('> error: ' + error)
                            callback({error})
                        }else{
                            error = false
                            console.log('> [mongodb]: newId:' + result.value.next)
                            callback({error,client,newId:result.value.next})
                        }
                    })
                }
            })
        }
    })
 }

 export function upd(collection,data,callback){
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
                        })

                        if(modified.length==0){
                            modified = ' - NENHUMA ALTERAÇÃO'
                        }else{
                            modified = ' - ANTES DAS ALTERAÇÕES: ' + modified
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
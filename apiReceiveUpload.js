/* ########## Exemplo de uso da api: ##########

// Crie um arquivo api.js com o código abaixo.
// Altere o caminho para o modulo apiReceiveUpload se necessário.

import { apiReceiveUpload } from '../../libs/apiReceiveUpload'

export const config = {
    api:{
        bodyParser:false,
    }
}

export default async (req, res) => {
    await new Promise((resolve, reject) => {
        apiReceiveUpload(req,res,resolve,reject)
    })
}

########## Exemplo de uso da api: ########## */

import { ins,upd,sel } from './mongo'
import { strlen,clearString,strlower } from  './functions'
import { ObjectID } from 'mongodb'

const fs = require('fs')
const formidable = require('formidable');
const crypto = require("crypto");

export async function apiReceiveUpload(req,res,resolve,reject){
    const form = formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
        if(err){ 
            result(200,{ res: 'error',error: err },res,resolve)
        }else{  
            if(strlen(fields.token)==0){
                console.log('> error: access denied (1)')
                result(200,{ res: 'error',error: 'access denied (1)' },res,resolve)
            }else if(fields.token!=process.env.tokenApi){
                console.log('> error: access denied (2)')
                return { res: 'error',error: 'access denied (2)' }
            }else if(strlen(fields.params)==0){
                console.log('> error: no parameters sent')
                result(200,{ res: 'error',error: 'no parameters sent' },res,resolve)
            }else{
                const params = JSON.parse(fields.params)

                if(strlen(params.storage)==0){
                    console.log('> error: storage not set')
                    result(200,{ res: 'error',error: 'storage not set' },res,resolve)
                }else if(params.action=='registerUpdate'){
                    var oldName = files.file.name
                    var type = files.file.type

                    crypto.randomBytes(16, (err, hash) => {
                        if(err){
                            result(200,{ res: 'error',error: err },res,resolve)
                        }else{            
                            var newName = clearString(oldName,true)
                            newName = strlower(newName)

                            newName = `${hash.toString("hex")}_${newName}`;

                            if(strlen(params._id)==0){
                                storage(params,res,resolve,files.file.path,newName,oldName,type);
                            }else{
                                sel('file',{_id:ObjectID(params._id)},{},(result) => {
                                    if(result.error){
                                        result(200,{ res: 'error',error: result.error },res,resolve)
                                    }else{
                                        var data = result.data[0]
            
                                        storageDelete(params,res,resolve,data.name,() => {
                                            storage(params,res,resolve,files.file.path,newName,oldName,type);
                                        })
                                    }
                                })
                            }
                        }
                    })
                }else if(params.action=='delete'){
                    sel('file',{_id:ObjectID(params._id)},{},(result) => {
                        if(result.error){
                            result(200,{ res: 'error',error: result.error },res,resolve)
                        }else{
                            var data = result.data[0]

                            storageDelete(params,res,resolve,data.name,() => {
                                register(res,resolve,'',params)
                            })
                        }
                    })
                }
            }
        }
    })
}

export function result(code,json,res,resolve){
    res.statusCode = code
    res.json(json)
    resolve()
}

export function register(res,resolve,base64,params,oldName,newName,path,pageName,ref,type){
    var data = {}

    if(strlen(params._id)>0){
        data._id = ObjectID(params._id)
    }

    if(params.action=='registerUpdate'){
        data.status = 1
        data.pageName = (strlen(pageName)>0 ? pageName : '')
        data.ref = (strlen(ref)>0 ? ref : '')
        data.oldName = oldName
        data.name = newName
        data.path = (strlen(path)>0 ? path : '')
        data.part = 1
        data.data = (strlen(base64)>0 ? base64 : '')
        data.type = type
        data.storage = params.storage
        
        if(strlen(params._id)==0){
            ins('file',data,(mongoResult) => {
                if(mongoResult.error){
                    result(200,{ res: 'error',error: mongoResult.error },res,resolve)
                }else{
                    result(200,{ res: 'success',name: oldName, data: mongoResult.data[0] },res,resolve)
                }
            },true)
        }else{
            upd('file',data,(mongoResult) => {
                if(mongoResult.error){
                    result(200,{ res: 'error',error: mongoResult.error },res,resolve)
                }else{
                    result(200,{ res: 'success',name: oldName, data: mongoResult.data[0] },res,resolve)
                }
            },true)
        }
    }else if(params.action=='delete'){
        data.status = 0
        data.data = ''
        data.type = ''
        upd('file',data,(mongoResult) => {
            if(mongoResult.error){
                result(200,{ res: 'error',error: mongoResult.error },res,resolve)
            }else{
                result(200,{ res: 'success',name: oldName, data: mongoResult.data[0] },res,resolve)
            }
        },true)
    }
}

function storage(params,res,resolve,path,name,oldName,type){
    if(params.storage=='HD'){
        
        ///// STORAGE HD /////

        if(strlen(params.path)==0){
            console.log('> error: path not set')
            result(200,{ res: 'error',error: 'path not set' },res,resolve)
        }else{
            try{
                const readableStream = fs.createReadStream(path)
                var writableStream = fs.createWriteStream(process.env.dirname + 'public/' + params.path + '/' + name)
                readableStream.pipe(writableStream, {end:false}).on('error', (error) => {
                    console.log('> error: ' + error)
                    result(200,{ res: 'error',error },res,resolve)
                })
                readableStream.on('end', () => {
                    readableStream.close()
                    fs.unlinkSync(path)
                    register(res,resolve,'',params,oldName,name,params.path,(params.pageName ? params.pageName : ''),(params.ref ? params.ref : ''),type)
                })
            }catch(e){
                console.log('> error: ' + e.toString())
                result(200,{ res: 'error',error: e.toString() },res,resolve)
            }
        }

        ///// END - STORAGE HD /////

    }else if(params.storage=='DB'){

        ///// STORAGE DB /////

        try{
            const readFileSync = fs.readFileSync(path)
            var base64 = Buffer.from(readFileSync).toString("base64")

            if(strlen(base64)>0){
                fs.unlinkSync(path)
                register(res,resolve,base64,params,oldName,name,'',(params.pageName ? params.pageName : ''),(params.ref ? params.ref : ''),type)
            }
        }catch(e){
            console.log('> error: ' + e.toString())
            result(200,{ res: 'error',error: e.toString() },res,resolve)
        }

        ///// END - STORAGE DB /////

    }else if(params.storage=='S3'){
        
        ///// STORAGE S3 /////

        if(strlen(params.bucket)==0){
            console.log('> error: bucket not set')
            result(200,{ res: 'error',error: 'bucket not set' },res,resolve)
        }else{
            try{                
                const readFileSync = fs.readFileSync(path)
                
                if(readFileSync){
                    var AWS = require('aws-sdk');                    
                    AWS.config.loadFromPath('./aws.config.json');
                    var s3 = new AWS.S3();

                    var paramsS3 = {
                        Bucket: params.bucket, 
                        Key: name, 
                        Body: readFileSync,  
                        ACL: "public-read", 
                        ContentType:type
                    };
                    s3.putObject(paramsS3, function(error, data) {
                        if(error){
                            console.log('> error: ' + error)
                            result(200,{ res: 'error', error },res,resolve)
                        }else{
                            fs.unlinkSync(path)
                            register(res,resolve,'',params,oldName,name,params.bucket,(params.pageName ? params.pageName : ''),(params.ref ? params.ref : ''),type)
                        }
                    });
                }
            }catch(e){
                console.log('> error: ' + e.toString())
                result(200,{ res: 'error',error: e.toString() },res,resolve)
            }
        }

        ///// END - STORAGE S3 /////

    }
}

function storageDelete(params,res,resolve,name,callback){
    if(params.storage=='HD'){
        
        ///// STORAGE HD /////

        if(strlen(params.path)==0){
            console.log('> error: path not set')
            result(200,{ res: 'error',error: 'path not set' },res,resolve)
        }else{
            try{
                fs.unlinkSync(process.env.dirname + 'public/' + params.path + '/' + name)
                callback()
            }catch(e){
                console.log('> error: ' + e.toString())
                result(200,{ res: 'error',error: e.toString() },res,resolve)
                return false
            }
        }

        ///// END - STORAGE HD /////

    }else if(params.storage=='DB'){

        ///// STORAGE DB /////

        try{
            callback()
        }catch(e){
            console.log('> error: ' + e.toString())
            result(200,{ res: 'error',error: e.toString() },res,resolve)
            return false
        }

        ///// END - STORAGE DB /////

    }else if(params.storage=='S3'){
        
        ///// STORAGE S3 /////

        if(strlen(params.bucket)==0){
            console.log('> error: bucket not set')
            result(200,{ res: 'error',error: 'bucket not set' },res,resolve)
        }else{
            try{
                var AWS = require('aws-sdk');                    
                AWS.config.loadFromPath('./aws.config.json');
                var s3 = new AWS.S3();
                var paramsS3 = {
                    Bucket: params.bucket, 
                    Key: name
                };
                s3.deleteObject(paramsS3, function(error, data) {
                    if(error){
                        console.log('> error: ' + error)
                        result(200,{ res: 'error', error },res,resolve)
                        return false
                    }else{
                        callback()
                    }
                });
            }catch(e){
                console.log('> error: ' + e.toString())
                result(200,{ res: 'error',error: e.toString() },res,resolve)
                return false
            }
        }

        ///// END - STORAGE S3 /////

    }
}
export function clearString(str,withoutSpace,withoutDot){
    var newStr = str.normalize('NFD')
    newStr = newStr.replace(/[\u0300-\u036f]/g, '')
    newStr = newStr.replace(/\s/g, 'SpAcEsPaCe')
    newStr = newStr.replace(/\./g, 'DoTdOt')
    newStr = newStr.replace(/([^\w]+|\s+)/g, '')

    if(typeof withoutSpace !== 'undefined'){
        newStr = newStr.replace(/SpAcEsPaCe/g, '_')
    }else{
        newStr = newStr.replace(/SpAcEsPaCe/g, ' ')
    }

    if(typeof withoutDot !== 'undefined'){
        newStr = newStr.replace(/DoTdOt/g, '')
    }else{
        newStr = newStr.replace(/DoTdOt/g, '.')
    }

    return newStr
}

export function decimal(number,precision,usa){
    var numberTemp = number
    
    if(typeof numberTemp === 'string'){
        console.log('1: ' + numberTemp)
        if(numberTemp.indexOf(',')!=-1){
            numberTemp = numberTemp.replace('.','')
            numberTemp = numberTemp.replace(',','.')
        }
        numberTemp = parseFloat(numberTemp)
        console.log('2: ' + numberTemp)
    }

    numberTemp = numberTemp * 1
    console.log('3: ' + numberTemp)
    if(typeof usa === 'undefined'){
        numberTemp = numberTemp.toFixed(precision)
        numberTemp = numberTemp.replace('.',',')
    }
    console.log('4: ' + numberTemp) 
    return numberTemp
}

export function fromTo(map,data){
    var newData = []
    data.map(v => {
        var newDataTemp = {}
        Object.keys(v).map(k => {
            if(typeof map[k] !== 'undefined'){
                if(typeof map[k].value !== 'undefined'){
                    if(map[k].value.indexOf('date')==-1){
                        if(map[k].value!='_id'){
                            if(map[k].type=='text'){
                                newDataTemp[map[k].value] = v[k]
                            }else{
                                newDataTemp[map[k].value] = (v[k] * 1)
                            }
                        }else{
                            newDataTemp[map[k].value] = (v[k] * 1)
                            newDataTemp['_idOld'] = (v[k] * 1)
                        }
                    }else{
                        if(v[k].length>=13){
                            newDataTemp[map[k].value] = (v[k] * 1)
                        }else{
                            newDataTemp[map[k].value] = (v[k].toString() + "000") * 1 
                        }
                    }
                }
            }
        })
        newData.push(newDataTemp)
    })
    return newData
}

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

export function keyboardEvent(callback){
    window.addEventListener("keydown",(e) => callback(e.key))
}

export function setCols(c1,c2,c3,c4,c5,mb){
    var cols = "";

    if(typeof c1 !== 'undefined') cols = cols + " col-" + c1
    if(typeof c2 !== 'undefined') cols = cols + " col-sm-" + c2
    if(typeof c3 !== 'undefined') cols = cols + " col-md-" + c3
    if(typeof c4 !== 'undefined') cols = cols + " col-lg-" + c4
    if(typeof c5 !== 'undefined') cols = cols + " col-xl-" + c5
    if(typeof mb !== 'undefined'){
        if(mb==1){
            cols = cols + " mb-2 mb-sm-0"
        }else if(mb==2){
            cols = cols + " mb-2 mb-md-0"
        }else{
            cols = cols + " mb-2 mb-sm-0"
        }
    }
    
    return cols;
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

export function setSubState(obj,update){
    var newObj = obj
    Object.keys(update).map(key => {
        if(update[key]){
            newObj[key] = update[key]
        }
    })
    return newObj
}

export function sign(obj){
    obj.user = getSession("userData").user
    obj.userName = getSession("userData").userName
    obj.branch = getSession("userData").branch
    obj.branchName = getSession("userData").branchName
    return obj
}

export function strlen(string){
    if(typeof string === 'undefined'){
        return 0
    }else{
        return string.toString().length
    }
}

export function strlower(string){
    if(typeof string === 'undefined'){
        return ''
    }else{
        return string.toLowerCase()
    }
}

export function strupper(string){
    if(typeof string === 'undefined'){
        return ''
    }else{
        return string.toUpperCase()
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
        }
    }catch(e){
        return false
    }
}

export function zeroLeft(value,digit){
    var zeroLeft = "";

    if(typeof value !== 'undefined'){
        for(var i = 0;i < (digit - value.toString().length);i++){
            zeroLeft = "0" + zeroLeft;
        }
    }

    zeroLeft = zeroLeft + value;

    return zeroLeft
}
export function clearNumber(number){
    if(number !== undefined){
        number = number.toString()
        if(strlen(number)>0){
            number = number.replace(/[^0-9]/g,'');
        }
        return number
    }else{
        return number
    }
}

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

export function count(obj){
    if(typeof obj === 'undefined'){
        return 0
    }else{
        return obj.length
    }
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

export function diacriticSensitiveRegex(string = '') {
    return string.replace(/a/g, '[a,á,à,ä]')
       .replace(/e/g, '[e,é,ë]')
       .replace(/i/g, '[i,í,ï]')
       .replace(/o/g, '[o,ó,ö,ò]')
       .replace(/u/g, '[u,ü,ú,ù]');
}

export function formatTimestamp(date){
    date = date.replace(/T/g,'-')
    date = date.replace(/:/g,'-')
    date = date.split('-')
    var year = (date[0] !== undefined ? date[0] : 0)
    var month = (date[1] !== undefined ? (date[1] - 1) : 0)
    var day = (date[2] !== undefined ? date[2] : 0)
    var hours = (date[3] !== undefined ? date[3] : 0)
    var minutes = (date[4] !== undefined ? date[4] : 0)
    var seconds = (date[5] !== undefined ? date[5] : 0)
    var timestamp = new Date(year, month, day, hours, minutes, seconds, 0).getTime()
    return timestamp
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
                            if(map[k].join !== undefined){
                                map[k].join.map(join => {
                                    if(count(join.data[v[k]])>0){
                                        if(join.map.type=='text'){
                                            newDataTemp[join.map.value] = join.data[v[k]]
                                        }else{
                                            newDataTemp[join.map.value] = (join.data[v[k]] * 1)
                                        }
                                    }
                                })
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

export function verifyCpfCnpj(cpfCnpj){
    cpfCnpj = clearNumber(cpfCnpj)
    if(strlen(cpfCnpj)==11){
        if(cpfCnpj.match(/(\d)\1{10}/)){
            return false
        }

        for(var t = 9;t < 11;t++){
            var d = 0
            for(var c = 0;c < t;c++){
                d += parseInt(cpfCnpj.substr(c,1)) * ((t + 1) - c)
            }
            d = ((10 * d) % 11) % 10
            if(cpfCnpj.substr(c,1) != d){
                return false
            }
        }
        
        return true
    }else if(strlen(cpfCnpj)==14){
        var soma = 0;
        
        soma += (parseInt(cpfCnpj.substr(0,1)) * 5);
        soma += (parseInt(cpfCnpj.substr(1,1)) * 4);
        soma += (parseInt(cpfCnpj.substr(2,1)) * 3);
        soma += (parseInt(cpfCnpj.substr(3,1)) * 2);
        soma += (parseInt(cpfCnpj.substr(4,1)) * 9);
        soma += (parseInt(cpfCnpj.substr(5,1)) * 8);
        soma += (parseInt(cpfCnpj.substr(6,1)) * 7);
        soma += (parseInt(cpfCnpj.substr(7,1)) * 6);
        soma += (parseInt(cpfCnpj.substr(8,1)) * 5);
        soma += (parseInt(cpfCnpj.substr(9,1)) * 4);
        soma += (parseInt(cpfCnpj.substr(10,1)) * 3);
        soma += (parseInt(cpfCnpj.substr(11,1)) * 2);
        
        var d1 = soma % 11;
        var d1 = d1 < 2 ? 0 : 11 - d1;
        
        soma = 0;
        soma += (parseInt(cpfCnpj.substr(0,1)) * 6);
        soma += (parseInt(cpfCnpj.substr(1,1)) * 5);
        soma += (parseInt(cpfCnpj.substr(2,1)) * 4);
        soma += (parseInt(cpfCnpj.substr(3,1)) * 3);
        soma += (parseInt(cpfCnpj.substr(4,1)) * 2);
        soma += (parseInt(cpfCnpj.substr(5,1)) * 9);
        soma += (parseInt(cpfCnpj.substr(6,1)) * 8);
        soma += (parseInt(cpfCnpj.substr(7,1)) * 7);
        soma += (parseInt(cpfCnpj.substr(8,1)) * 6);
        soma += (parseInt(cpfCnpj.substr(9,1)) * 5);
        soma += (parseInt(cpfCnpj.substr(10,1)) * 4);
        soma += (parseInt(cpfCnpj.substr(11,1)) * 3);
        soma += (parseInt(cpfCnpj.substr(12,1)) * 2);
        
        
        var d2 = soma % 11;
        d2 = d2 < 2 ? 0 : 11 - d2;
        
        if(parseInt(cpfCnpj.substr(12,1)) == d1 && parseInt(cpfCnpj.substr(13,1)) == d2){
            return true;
        }else{
            return false;
        }
    }else{
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
import { api,getHostApi,getTokenApi } from './api'

export function clearNumber(number){
    if(verifyVariable(number)){
        number = number.toString()
        if(strlen(number)>0){
            number = number.replace(/[^0-9]/g,'');
        }
        return number
    }else{
        return ''
    }
}

export function clearString(str,withoutSpace,withoutDot,withAtSign,withComma){
    if(verifyVariable(str)){
        var newStr = str.normalize('NFD')
        newStr = newStr.replace(/@/g, 'AtSiGnAtSiGn')
        newStr = newStr.replace(/,/g, 'CoMmAcOmMa')
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

        if(typeof withAtSign === 'undefined'){
            newStr = newStr.replace(/AtSiGnAtSiGn/g, '')
        }else{
            newStr = newStr.replace(/AtSiGnAtSiGn/g, '@')
        }

        if(typeof withComma === 'undefined'){
            newStr = newStr.replace(/CoMmAcOmMa/g, '')
        }else{
            newStr = newStr.replace(/CoMmAcOmMa/g, ',')
        }

        return newStr
    }else{
        return str
    }
}

export function count(obj){
    if(!verifyVariable(obj)){
        return 0
    }else if(typeof obj === 'object'){
        return Object.keys(obj).length
    }else{
        return obj.length
    }
}

export function decimal(number,precision,usa){
    var numberTemp = number
    
    if(typeof numberTemp === 'string'){
        if(numberTemp.indexOf(',')!=-1){
            numberTemp = numberTemp.replace('.','')
            numberTemp = numberTemp.replace(',','.')
        }
        numberTemp = parseFloat(numberTemp)
    }

    numberTemp = numberTemp * 1
    if(typeof usa === 'undefined'){
        numberTemp = numberTemp.toFixed(precision)
        numberTemp = numberTemp.replace('.',',')
    } 
    return numberTemp
}

export function diacriticSensitiveRegex(string = '') {
    return string.replace(/a/g, '[a,á,à,ä]')
       .replace(/e/g, '[e,é,ë]')
       .replace(/i/g, '[i,í,ï]')
       .replace(/o/g, '[o,ó,ö,ò]')
       .replace(/u/g, '[u,ü,ú,ù]');
}

export function formatCep(cep){
    if(strlen(cep)==0){
        return '';
    }else{
        cep = cep.substr(0, 2) + "." + cep.substr(2, 3) + "-" + cep.substr(5, 3);
        return cep;
    }
}

export function formatCpfCnpj(cpfCnpj){
    if(!verifyVariable(cpfCnpj)){
        return cpfCnpj
    }else{
        cpfCnpj = clearNumber(cpfCnpj)
        if(strlen(cpfCnpj)>11){
            if(strlen(cpfCnpj)==13){
                cpfCnpj = '0' + cpfCnpj                
            }
            return cpfCnpj.substr(0,2) + '.' + cpfCnpj.substr(2,3) + '.' + cpfCnpj.substr(5,3) + '/' + cpfCnpj.substr(8,4) + '-' + cpfCnpj.substr(12,2)
        }else{
            if(strlen(cpfCnpj)==10){
                cpfCnpj = '0' + cpfCnpj                
            }
            return cpfCnpj.substr(0,3) + '.' + cpfCnpj.substr(3,3) + '.' + cpfCnpj.substr(6,3) + '-' + cpfCnpj.substr(9,2)
        }
    }
}

export function formatDate(timestamp,mode){
    const now = new Date()
    if(verifyGreater(timestamp)){
        now.setTime(timestamp)
    }

    if(mode=='date abb 1'){
        return zeroLeft(now.getDate(),2) + '/' + zeroLeft(now.getMonth()+1,2) + '/' + now.getFullYear()
    }else if(mode=='RFC'){
        return now.getFullYear() + '-' + zeroLeft(now.getMonth()+1,2) + '-' + zeroLeft(now.getDate(),2)
    }else{
        return zeroLeft(now.getDate(),2) + '/' + zeroLeft(now.getMonth()+1,2) + '/' + now.getFullYear() + ' ' + zeroLeft(now.getHours(),2) + ':' + zeroLeft(now.getMinutes(),2) + ':' + zeroLeft(now.getSeconds(),2)
    }
}

export function formatNumber(number,precision,mode,resultInString) {
    if(mode === undefined){
        if(verifyVariable(number)){
            number = number.toString()
            return number.replace(/\./g, ',')
        }else{
            return number
        }
    }else if(mode == 'usa'){
        if(verifyVariable(number)){
            if(strlen(number)==0){
                number = 0
            }
            number = number.toString()
            if(number=='NaN'){
                number = 0
            }
            number = number.toString()
            number = number.replace(/,/g, '.')
            if(verifyVariable(precision)){
                number = parseFloat(number).toFixed(precision)
            }
            if(verifyVariable(resultInString)){
                return number
            }else{
                return number * 1
            }
        }else{
            return 0
        }
    }else if(mode == 'bra'){
        if(verifyVariable(number)){
            if(strlen(number)==0){
                number = 0
            }
            number = number.toString()
            if(number=='NaN'){
                number = 0
            }
            number = number.toString()
            number = number.replace(/,/g, '.')
            if(verifyVariable(precision)){
                number = parseFloat(number).toFixed(precision)
            }
            return number.replace(/\./g, ',')
        }else{
            return number
        }
    }else{
        return number
    }
}

export function formatPhone(phone){
    phone = clearNumber(phone)
    
    if(strlen(phone)>0){
        var newPhone = ''
        if(strlen(phone)<=4){
            if(phone==0){
                newPhone = '';
            }else{
                newPhone = phone;
            }
        }else{
            if(strlen(phone)>4 && strlen(phone)<=8){
                newPhone = phone.substr(-4);
                newPhone = phone.substr(-strlen(phone)).substr(0,strlen(phone)-4) + "-" + newPhone;
            }else if(strlen(phone)>4 && strlen(phone)<=9){
                newPhone = phone.substr(-4);
                newPhone = phone.substr(-strlen(phone)).substr(0,strlen(phone)-4) + "-" + newPhone;
            }else if(strlen(phone)==10 && phone.substr(0,1)!=0){
                newPhone = phone.substr(-4);
                newPhone = phone.substr(-8).substr(0,4) + "-" + newPhone;
                newPhone = "(" + phone.substr(0,2) + ") " + newPhone;
            }else if(strlen(phone)==11 && phone.substr(0,1)!=0){
                newPhone = phone.substr(-4);
                newPhone = phone.substr(-9).substr(0,5) + "-" + newPhone;
                newPhone = "(" + phone.substr(0,2) + ") " + newPhone;
            }
        }
        return newPhone;
    }else{
        return '';
    }
}

export function formatRgIe(rgIe){
    if(!verifyVariable(rgIe)){
        return rgIe
    }else{
        rgIe = clearNumber(rgIe)
        if(strlen(rgIe)==9){
            return rgIe.substr(0,2) + '.' + rgIe.substr(2,3) + '.' + rgIe.substr(5,3) + '-' + rgIe.substr(8,1)
        }else{
            var newRgIe = ''
            var rgIeTemp = rgIe
            while(strlen(rgIeTemp)>0){
                if(strlen(newRgIe)>0){
                    newRgIe += '.'
                }
                newRgIe += rgIeTemp.substr(0,3)
                rgIeTemp = rgIeTemp.substr(3)
            }
            return newRgIe
        }
    }
}

export function formatTimestamp(date){
    if(verifyVariable(date)){
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
    }else{
        return date
    }
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

export function getSession(key,pagename,backend,callback){
    if(backend === undefined){
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
    }else{
        var userData = getSession('userData')
        if(userData){
            var data = {}
            data.token = userData.token
            data.access = userData.access
            data.user = userData.user
            data._type = 'get'
            data.key = key
            data.pagename = pagename
            api(getHostApi() + 'api/storageBackend',getTokenApi(),data,(res) => {
                if(res.error){
                    console.log(res.error)
                    callback(false)
                }else if(count(res.data)==1){
                    callback(res.data[0])
                }else{
                    callback(res.data)
                }
            })
        }else{
            callback(false)
        }                
    }
}

export function keyboardEvent(callback){
    window.addEventListener("keydown",(e) => callback(e.key))
}

export function setCols(c1,c2,c3,c4,c5,mb){
    var cols = "";
    var zero = false

    if(typeof c1 !== 'undefined'){
        if(c1>0){
            cols = cols + " col-" + c1 + (zero===true ? " d-md-flex" : "")
        }else{
            zero = true
            cols = cols + " d-xs-none"
        }
    }
    if(typeof c2 !== 'undefined'){
        if(c2>0){
            cols = cols + " col-sm-" + c2 + (zero===true ? " d-md-flex" : "")
        }else{
            zero = true
            cols = cols + " d-sm-none"
        }
    }
    if(typeof c3 !== 'undefined'){
        if(c3>0){
            cols = cols + " col-md-" + c3 + (zero===true ? " d-md-flex" : "")
        }else{
            zero = true
            cols = cols + " d-md-none"
        }
    }
    if(typeof c4 !== 'undefined'){
        if(c4>0){
            cols = cols + " col-lg-" + c4 + (zero===true ? " d-md-flex" : "")
        }else{
            zero = true
            cols = cols + " d-lg-none"
        }
    }
    if(typeof c5 !== 'undefined'){
        if(c5>0){
            cols = cols + " col-xl-" + c5 + (zero===true ? " d-md-flex" : "")
        }else{
            zero = true
            cols = cols + " d-xl-none"
        }
    }
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

export function setSession(key,data,pagename,lifetime,backend,callback){
    if(backend === undefined){
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
    }else{
        var userData = getSession('userData')
        if(userData){
            var sessionData = data
            var data = {}
            data.token = userData.token
            data.access = userData.access
            data.user = userData.user
            data._type = 'set'
            data.key = key
            data.data = sessionData
            data.pagename = pagename
            data.lifetime = lifetime
            api(getHostApi() + 'api/storageBackend',getTokenApi(),data,(res) => {
                if(res.error){
                    console.log(res.error)
                    callback(false)
                }else{
                    callback(true)
                }
            })
        }else{
            callback(false)
        }               
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

export function shuffle(string){
    var a = string.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

export function sign(obj){
    var userData = getSession("userData")
    obj.access = userData.access
    obj.user = (obj.user === undefined ? userData.user : obj.user)
    obj.userUpdate = userData.user
    obj.userName = (obj.userName === undefined ? userData.userName : obj.userName)
    obj.userNameUpdate = userData.userName
    obj.branch = (obj.branch === undefined ? userData.branch[userData.branchSelected]._id : obj.branch)
    obj.branchName = (obj.branchName === undefined ? userData.branch[userData.branchSelected].name : obj.branchName)
    obj.token = userData.token
    return obj
}

export function standardClear(data){
    if(verifyVariable(data.cpfCnpj)){ data.cpfCnpj = clearNumber(data.cpfCnpj) }
    if(verifyVariable(data.rgIe)){ data.rgIe = clearNumber(data.rgIe) }
    if(verifyVariable(data.email)){ data.email = clearString(data.email,true,undefined,true,true) }
    if(verifyVariable(data.cellphone)){ data.cellphone = clearNumber(data.cellphone) }
    if(verifyVariable(data.phone1)){ data.phone1 = clearNumber(data.phone1) }
    if(verifyVariable(data.phone2)){ data.phone2 = clearNumber(data.phone2) }
    if(verifyVariable(data.skype)){ data.skype = clearString(data.skype) }

    return data
}

export function strlen(string){
    if(!verifyVariable(string)){
        return 0
    }else{
        return string.toString().length
    }
}

export function strlower(string){
    if(!verifyVariable(string)){
        return ''
    }else{
        return string.toLowerCase()
    }
}

export function strupper(string){
    if(!verifyVariable(string)){
        return ''
    }else{
        return string.toUpperCase()
    }
}

export function ucFirst(string){
    var firstLetter = string.slice(0,1)
    return firstLetter.toUpperCase() + string.substring(1)
}

export function unSetSession(key,pagename,backend,callback){
    if(backend=== undefined){
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
    }else{
        var userData = getSession('userData')
        if(userData){
            var data = {}
            data.token = userData.token
            data.access = userData.access
            data.user = userData.user
            data._type = 'unSet'
            data.key = key
            data.pagename = pagename
            api(getHostApi() + 'api/storageBackend',getTokenApi(),data,(res) => {
                if(res.error){
                    console.log(res.error)
                    callback(false)
                }else{
                    callback(true)
                }
            })
        }else{
            callback(false)
        }                
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

export function verifyGreater(variable){
    if(variable === undefined){
        return false
    }else if(variable == null){
        return false
    }else if(strlen(variable)==0){
        return false
    }else if(variable>0){
        return true
    }else{
        return false
    }
}

export function verifyVariable(variable){
    if(variable === undefined){
        return false
    }else if(variable == null){
        return false
    }else{
        return true
    }
}

export function zeroLeft(value,digit){
    var zeroLeft = "";

    if(verifyVariable(value)){
        for(var i = 0;i < (digit - value.toString().length);i++){
            zeroLeft = "0" + zeroLeft;
        }
    }

    zeroLeft = zeroLeft + value;

    return zeroLeft
}
export function getSession(key,pagename){
    try{
        if(typeof pagename === 'undefined'){
            pagename = 'app'
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
            pagename = 'app'
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

    for(var i = 0;i < (digit - value.toString().length);i++){
        zeroLeft = "0" + zeroLeft;
    }

    zeroLeft = zeroLeft + value;

    return zeroLeft
}
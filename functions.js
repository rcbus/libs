export function setCols(c1,c2,c3,c4,c5){
    var cols = "";

    if(typeof c1 !== 'undefined') cols = cols + " col-" + c1
    if(typeof c2 !== 'undefined') cols = cols + " col-sm-" + c2
    if(typeof c3 !== 'undefined') cols = cols + " col-md-" + c3
    if(typeof c4 !== 'undefined') cols = cols + " col-lg-" + c4
    if(typeof c5 !== 'undefined') cols = cols + " col-xl-" + c5
    
    return cols;
}

export function setSubState(obj,update){
    Object.keys(update).map(key => (
      obj[key] = update[key]
    ))
    return obj
}

export function zeroLeft(value,digit){
    var zeroLeft = "";

    for(var i = 0;i < (digit - value.toString().length);i++){
        zeroLeft = "0" + zeroLeft;
    }

    zeroLeft = zeroLeft + value;

    return zeroLeft
}
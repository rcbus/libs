import { verifyVariable,verifyGreater,strlen } from './functions'

export function basic(data,variable){
    if(verifyVariable(variable)){
        Object.keys(data).map(k => {
            if(verifyVariable(variable[k])){ 
                if(variable[k].type == 0 && data[k]!=null){
                    if(strlen(data[k])==0){
                        data[k] = 0
                    }
                    data[k] = (parseFloat(data[k]).toFixed(variable[k].precision) * 1)
                }else if(data[k]==null){
                    data[k] = ''
                }
            }
        })
    }

    data.subTotal = data.amount * data.value
    if(verifyGreater(data.discountValue) && verifyGreater(data.subTotal)){
        data.discount = data.discountValue / data.subTotal
        data.discount = data.discount * 100
    }
    if(verifyGreater(data.discount)){
        data.discount = data.discount / 100
        data.discountValue = data.subTotal * data.discount
        data.discount = data.discount * 100
    }
    if(!verifyGreater(data.discountValue)){
        data.discountValue = 0
    }
    data.subTotalDiscount = data.subTotal - data.discountValue
        
    if(verifyGreater(data.generalDiscountValue)){
        data.subTotalDiscount = data.subTotalDiscount - data.generalDiscountValue
    }
    data.volume = data.amount / data.perPackage
    data.totalNetWeight = data.netWeight * data.amount
    data.totalGrossWeight = data.grossWeight * data.amount
    if(verifyGreater(data.volume)){
        data.totalCubage = data.volume * data.cubage
    }

    if(verifyVariable(variable)){
        Object.keys(data).map(k => {
            if(verifyVariable(variable[k])){ 
                if(variable[k].type == 0 && data[k]!=null){
                    data[k] = (parseFloat(data[k]).toFixed(variable[k].precision) * 1)
                }else if(data[k]==null){
                    data[k] = ''
                }
            }
        })
    }

    return data
}

export function complex(data,variable,calculation){
    calculation.map(c => {
        if(c.operator=='='){
            var tempB = 0
            if(strlen(c.value)){
                tempB = formatNumber(c.value,10,0)
            }else if(verifyVariable(variable[c.variableB])){
                tempB = formatNumber(data[variable[c.variableB].description],variable[c.variableB].precision,variable[c.variableB].type)
            }
            if(verifyVariable(variable[c.variableA])){
                data[variable[c.variableA].description] = formatNumber(tempB,variable[c.variableA].precision,variable[c.variableA].type)
            }
        }else{
            var tempA = formatNumber(data[variable[c.variableA].description],variable[c.variableA].precision,variable[c.variableA].type)
            var tempB = 0
            var tempR = 0
            if(strlen(c.value)){
                tempB = formatNumber(c.value,10,0)
            }else if(verifyVariable(variable[c.variableB])){
                tempB = formatNumber(data[variable[c.variableB].description],variable[c.variableB].precision,variable[c.variableB].type)
            }
            if(c.operator=='/'){
                if(tempB>0){
                    tempR = (tempA / tempB)
                }
            }else if(c.operator=='*'){
                tempR = (tempA * tempB)
            }else if(c.operator=='+'){
                tempR = (tempA + tempB)
            }else if(c.operator=='-'){
                tempR = (tempA - tempB)
            }
            if(verifyVariable(variable[c.variableR])){
                data[variable[c.variableR].description] = formatNumber(tempR,variable[c.variableR].precision,variable[c.variableR].type)
            }
        }
    })
    return data
}

export function formatNumber(number,precision,type){
    if(type == 0 && verifyVariable(number) && verifyVariable(precision)){
        if(number!=null){
            if(strlen(number)==0){
                number = 0
            }
            return (parseFloat(number).toFixed(precision) * 1)
        }else{
            return 0
        }
    }else if(number!=null){
        return number
    }else{
        return ''
    }
}
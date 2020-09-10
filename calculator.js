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
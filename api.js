export async function api(host,token,data,callback) {
    const res = await fetch(host,{
        method: 'post',
        body: JSON.stringify({
            token,
            data
        })
    })
    const returnData = await res.json();
    if(returnData){
        callback(returnData)
    }
}

export function security(req) {
    if(req.body.length==0){
        console.log('> error: no body')
        return { res: 'error',error: 'no body' }
    }else{
        const body = JSON.parse(req.body)
        if(typeof body.token === 'undefined'){
            console.log('> error: access denied (1)')
            return { res: 'error',error: 'access denied (1)' }
        }else if(body.token.length==0){
            console.log('> error: access denied (2)')
            return { res: 'error',error: 'access denied (2)' }
        }else if(body.token!=process.env.tokenApi){
            console.log('> error: access denied (3)')
            return { res: 'error',error: 'access denied (3)' }
        }else{
            console.log('> [api]: access allowed')
            return { res: 'success',data: body.data }
        }
    }
}
export function security(req) {
    if(req.body.length==0){
        return { res: 'error',error: 'No body' }
    }else{
        const body = JSON.parse(req.body)
        if(typeof body.token === 'undefined'){
            return { res: 'error',error: 'Access denied (1)' }
        }else if(body.token.length==0){
            return { res: 'error',error: 'Access denied (2)' }
        }else if(body.token!=process.env.tokenApi){
            return { res: 'error',error: 'Access denied (3)' }
        }else{
            return { res: 'success',data: body.data }
        }
    }
}
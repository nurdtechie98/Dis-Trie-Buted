const checkPrime = (n) => {
    // Since the data is not actually serialised no need to transform explicitly
    var flag = true
    for(let i = 2; i < n; i++){
        if(n%i){
            continue
        }else{
            flag = false
            break
        }
    }

    // returning currNo, prime/non, terminate?
    if(n==100){
        return [n,flag,true]
    }
    else{
        return [n,flag,false]
    }

}

onmessage = (e) => postMessage(checkPrime(e.data))
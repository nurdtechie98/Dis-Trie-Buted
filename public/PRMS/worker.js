const checkPrime = (n, limit) => {
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
    // postmessage to socket.js
    if(n==limit){
        return [n,flag,true]
    }
    else{
        return [n,flag,false]
    }
}

// receive parameters for the algorithm, from socket.js
onmessage = (e) => postMessage(checkPrime(e.data[0], e.data[1]))
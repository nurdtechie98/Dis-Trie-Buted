const checkPrime = (data) => {
    // Since the data is not actually serialised no need to transform explicitly
    // console.log(`data received at worker ${data}`)
    var flag = true
    for(let i = 2; i < data; i++){
        if(data%i){
            continue
        }else{
            flag = false
            break
        }
    }

    return [data, flag]
}

// receive parameters for the algorithm, from socket.js
onmessage = (e) => {
    // e.data -> start | step | fileLoc
    // Need to create input data
    var inputData = []
    
    if(e.data[2]){
        // Creating input data from certain file
    }
    else{
        // Creating input data on your own
        for(let i=e.data[0]; i<(e.data[0] + e.data[1]); i++){
            inputData.push(i);
        }
    }

    // Now creating an outputData array
    var outputData = []

    // This is calculated synchronously, since single threaded
    inputData.forEach((data) => outputData.push(checkPrime(data)))

    // Finally output message on mainThread once calculations done
    postMessage(outputData);
}
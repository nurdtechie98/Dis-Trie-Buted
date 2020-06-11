// Algorithm to execute on each worker thread
const summation = (line) => {
    return line.includes('puppy');
}

// receive parameters for the algorithm, from socket.js
onmessage = (e) => {
    // e.data -> start | step | fileLoc
    // Need to create input data
    var inputData = []
    var outputData = []
    
    // If file location given, need to read from file
    if(e.data[2]){

        // Creating input data from certain file
        async function makeTextFileLineIterator(fileURL) {
            const utf8Decoder = new TextDecoder('utf-8');
            const response = await fetch(fileURL, {headers: {Range: `bytes=${e.data[0]}-${e.data[0] + e.data[1]}`}});
            const reader = response.body.getReader();
            let { value: chunk, done: readerDone } = await reader.read();
            chunk = chunk ? utf8Decoder.decode(chunk) : '';
            return chunk.split("\n");
        }
        
        // Since reading file is async need async await, then...
        // Also note that, reading a csv over here, as mentioned in corresponding config file
        makeTextFileLineIterator(e.data[2]).then((data) => {
            lines = inputData;
            console.log(inputData.length);

            // This is calculated synchronously, since single threaded
            inputData.forEach((data, index) => {
                if(summation(data)){
                    outputData.push(index);
                }
            })
        
            // Finally output message on mainThread once calculations done
            postMessage(outputData);
        })
    }
    else{
        // Creating input data on your own
        for(let i=e.data[0]; i<(e.data[0] + e.data[1]); i++){
            inputData.push(i);
        }

        // This is calculated synchronously, since single threaded
        inputData.forEach((data) => outputData.push(summation(data)))
        
        // Finally output message on mainThread once calculations done
        postMessage(outputData);
    }
}
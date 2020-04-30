// Algorithm to execute on each worker thread
const summation = (data) => {

    var sum = 0;

    // sum += weight * attribute value
    sum += 85 * parseFloat(data[0]);
    sum += 10 * parseFloat(data[1]);
    sum += 70 * parseFloat(data[2]);
    sum += 100 * parseFloat(data[3]);
    sum += 90 * parseFloat(data[4]);
    sum += 80 * parseFloat(data[5]);
    sum += 45 * parseFloat(data[6]);
    sum += 50 * parseFloat(data[7]);
    sum += 20 * parseFloat(data[8]);
    sum += 40 * parseFloat(data[9]);
    sum += 30 * parseFloat(data[10]);
    sum += 50 * parseFloat(data[11]);
    sum += 10 * parseFloat(data[12]);
    
    return sum;
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
            lines = data;
            for(var i=0; i<lines.length - 1; i++){
                var temp = lines[i].split(",");
                if(temp.length > 1){
                    inputData.push(temp);
                }
            }

            console.log(inputData.length);

            // This is calculated synchronously, since single threaded
            inputData.forEach((data) => outputData.push(summation(data)))
        
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
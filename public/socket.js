// Common script for all kinds of applications
// Will ALWAYS be served to the slave node
// Defines the communication between slave and master node

const cores = navigator.hardwareConcurrency

// To store results returned from each thread
var outputData = []
// To store all worker threads, together forms a team
var team = []
// To store status of those threads, as they don't provide it implictly
var stat = []

// to terminate a web worker
const terminate = (id) => {

    // Terminating a specific worker by accessing by id
    team[id].terminate()

    // Setting the status of worker to 0
    stat[id] = 0

    console.log("stat - ", stat)

    // checking status of each thread, if it is 0 for all, emit processingDone
    if(stat.reduce((total,cur) => total+cur) === 0){
        console.log(`All threads have been terminated`)
        // processingDone message sent to master node, with the data
        socket.emit('processingDone',outputData)
    }
}

socket.once('initialize', (url) => {

    // Need to close earlier workers and clear the worker team
    team.forEach((worker) => worker.terminate());

    // Reset the worker team and their status
    team = [];
    stat = [];

    // Need to create array of workers, and define their behaviour
    for(let i=0; i<cores; i++){
        var myWorker = new Worker(url);

        // Assigning data as per cores, as that is what is received
        outputData[i] = [];

        // Each worker will be allocated a fixed array of tasks to perform
        // So each worker, spawns and executes exactly one time

        // Can optimize here, by dynamically calling postMessage for each onnessage
        myWorker.onmessage = (res) => {
            // res -> outputData array -> [data,result]
            // Currently outputing data and result

            // Can optimize further by only giving dataIndex
            // And generating data on master node

            console.log(`calculation done from ${res.data[0][0]} to ${res.data[res.data.length-1][0]}`);
            
            // Since each worker works exactly once
            // Once they finish their array of tasks, it's complete and can be terminated
            outputData[i] = res.data;
            terminate(i);
        }

        // Finally pusing worker to the team
        team.push(myWorker);
        // Setting the status of worker to 1, as it is in use.
        stat.push(1);
    }

    console.log('Team of myWorkers created as ->', team);
    // Sending ready message to master node, to receive range next
    socket.emit('ready');
})

socket.once('range', (start, step, fileLoc) => {

    // Since data is really queues on the web worker side
    // We can just send the parameters to construct the input data
    // This will save communication costs as well

    // Alternatively we can find a complex solution
    // That reponds to every postMessage from workerScript

    // Creating starting parameters and step for each array
    // Ex. start -> 1000 step -> 300 cores -> 8
    // Need to divide as -> [1000 - 1037],[1038 - 1075],[1076 - 1113],[1114 - 1151]
    // [1152 - 1189],[1190 - 1227],[1228 - 1265],[1266 - 1300]

    // generating params for each worker thread here
    // inputData is generated on the thread itself to save communication costs
    var workerParams = []
    var workerStep = Math.ceil(step/cores)

    for(let i=0; i<(cores-1); i++){
        workerParams.push([start + (i*workerStep), workerStep, fileLoc])
    }

    // Last core will get all the remaining ones
    workerParams.push([start + ((cores-1)*workerStep), step - ((cores-1)*workerStep) + 1, fileLoc])

    for(let i=0; i<cores; i++){
        console.log(`Thread ${i} is alloted ${workerParams[i][0]} to ${workerParams[i][0] + workerParams[i][1]}`)
        team[i].postMessage(workerParams[i])
    }
})
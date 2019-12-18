// import {cores, resultDisplay} from './domElements'

const cores = navigator.hardwareConcurrency

// for displaying status of each thread ->
var resultDisplay = []

const resContainer = document.getElementsByClassName("result")[0];
const fin = document.getElementsByClassName("final")[0];

// creating elements that hold result for each thread
for(let i=0; i<cores; i++){
    let resRow = document.createElement("div")
    resRow.classList.add(`result__row`)
    resRow.id = `result__row--${i}`
    let resRowThread = document.createElement("div");
    let resRowData = document.createElement("div");
    let resRowStatus = document.createElement("div");

    resRowThread.classList.add(`result__thread`)
    resRowData.classList.add(`result__data`)
    resRowStatus.classList.add(`result__status`)

    resRowThread.textContent = `${i+1}`

    resRow.appendChild(resRowThread)
    resRow.appendChild(resRowData)
    resRow.appendChild(resRowStatus)

    resContainer.appendChild(resRow)

    // storing them in resultDisplay to alter it's contents next
    resultDisplay.push([resRowData, resRowStatus])
}

var inputData = []
var outputData = []
var team = []
var stat = []

// to terminate a web worker
const terminate = (id) => {
    team[id].terminate()
    stat[id] = 0

    console.log("stat - ", stat)

    // checking status of each thread, if it is 0 for all, emit processingDone
    if(stat.reduce((total,cur) => total+cur) === 0){
        socket.emit('processingDone',outputData)
    }
}

socket.on('initialize', (url) => {

    for(let i=0; i<cores; i++){
        var myWorker = new Worker(url);

        outputData[i] = [];

        myWorker.onmessage = (res) => {
            // res -> outputData array -> [dataIndex,result]
            // Note that this is dataIndex and not data, which saves time
            // Since we can generate the input data from dataIndex

            console.log(`calculation done from ${res.data[0][0]} to ${res.data[res.data.length-1][0]}`);
            terminate(i);
            outputData[i] = res.data;
        }
        team.push(myWorker);
        stat.push(1);
    }

    console.log('Team of myWorkers created as ->', team);
    socket.emit('ready');
})

socket.on('range', (start, step, fileLoc) => {

    // Since data is really queues on the web worker side
    // We can just send the parameters to construct the input data
    // This will save communication costs as well

    // Alternatively we can find a complex solution
    // That reponds to every postMessage from workerScript

    // Creating starting parameters and step for each array
    // Ex. start -> 1000 step -> 300 cores -> 8
    // Need to divide as -> [1000 - 1037],[1038 - 1075],[1076 - 1113],[1114 - 1151]
    // [1152 - 1189],[1190 - 1227],[1228 - 1265],[1266 - 1300]

    var workerParams = []
    var workerStep = Math.ceil(step/cores)

    for(let i=0; i<(cores-1); i++){
        workerParams.push([start + (i*workerStep), workerStep, fileLoc])
    }

    // Last core will get all the remaining ones
    workerParams.push([start + (cores-1*workerStep), step - (cores-1*workerStep) + 1, fileLoc])

    for(let i=0; i<cores; i++){
        team[i].postMessage(workerParams[i])
    }
})
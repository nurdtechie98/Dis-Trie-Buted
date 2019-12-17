// const socket = io.connect(`https://dis-trie-buted.herokuapp.com`)

// extract to worker.ejs as this will be different for every file 
// const socket = io.connect(`localhost:8080`)
const cores = navigator.hardwareConcurrency
const body = document.getElementsByTagName("body")[0]

var resultDisplay = []
const resContainer = document.getElementsByClassName("result")[0];
const fin = document.getElementsByClassName("final")[0];
const count = document.getElementsByClassName("count")[0];

var tot = 0;

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

    resultDisplay.push([resRowData, resRowStatus])
}

var data = []
var workers = []
var stat = []
var initData = []

const terminate = (id) => {
    workers[id].terminate()
    stat[id] = 0

    console.log("stat - ", stat)

    if(stat.reduce((tot,cur) => tot+cur) === 0){
        socket.emit('processingDone', [data,initData])
    }
}

socket.on('initialze', (loc)=>{
    console.log(`Worker file located at ${loc}`)
    for(let i=0; i<cores; i++){
        var myWorker = new Worker(loc)
        myWorker.onmessage = (response) => {
            // response => index | result | terminate ?
            data[response.data[0] - initData[0]] = response.data[1]
            resultDisplay[i][0].textContent = response.data[0];
            resultDisplay[i][1].textContent = response.data[1];
            if(response.data[1]){
                tot += 1;
                const primeDiv = document.createElement("div")
                primeDiv.classList.add('final__data')
                primeDiv.textContent = response.data[0]
                fin.appendChild(primeDiv)
                count.textContent = `Results - ${tot} primes`
            }
            if(response.data[2]){
                console.log("Response - ", response.data)
                terminate(i)
            }
        }

        workers.push(myWorker)
        stat.push(1)
    }
    console.log("Workers created as- ", workers)

    socket.emit('ready')
})

// At this point this data is going to be range
socket.on('range', (param)=>{
    var curr = param[0]
    var limit = param[1]

    initData[0] = curr
    initData[1] = limit

    // Initialise result array
    for(let i=0 ; i < limit-curr+1; i++){
        data.push(0)
    }

    console.log(`Recieved range is ${curr} to ${limit}`)
    
    while(curr < limit){
        for(let i=0; i<cores; i++){
            workers[i].postMessage([curr,limit])
            resultDisplay[i][0].textContent = curr
            resultDisplay[i][1].textContent = "None"
            curr += 1
            curr = Math.min(curr,limit)
        }

        if(curr === limit){
            for(let i=0; i<cores; i++){
                workers[i].postMessage([curr,limit])
            }
        }
    }
})
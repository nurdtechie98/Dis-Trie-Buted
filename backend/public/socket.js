const socket = io.connect('https://dis-trie-buted.herokuapp.com:8080')
const cores = navigator.hardwareConcurrency
const body = document.getElementsByTagName("body")[0]

var resultDisplay = []

for(let i=0; i<cores; i++){
    let res = document.createElement("div")
    res.classList.add(`result${i}`)
    resultDisplay.push(res)
    body.appendChild(res)
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
            resultDisplay[i].textContent = `Calculated- ${response.data[0]} as ${response.data[1]} at ${i}-Thread`
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
            resultDisplay[i].textContent = `Checking prime for - ${curr}`
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
const socket = io.connect('http://localhost:8080')
const cores = navigator.hardwareConcurrency

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
socket.on('range', (data)=>{
    var curr = data[0]
    var limit = data[1]

    initData[0] = curr
    initData[1] = limit

    // Initialise result array
    for(let i=0 ; i < limit-curr+1; i++){
        data.push(0)
    }

    console.log(`Recieved range is ${curr} to ${limit}`)
    
    while(curr < limit){
        console.log(`Currently calculating - ${curr}`)

        for(let i=0; i<cores; i++){
            workers[i].postMessage(curr)
            curr += 1
            curr = Math.min(curr,limit)
        }

        if(curr === limit){
            for(let i=0; i<cores; i++){
                workers[i].postMessage(curr)
            }
        }
    }
})
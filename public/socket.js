import {cores, resultDisplay, fin} from './domElements'

var data = []
var workers = []
var stat = []
var initData = []

// to terminate a web worker
const terminate = (id) => {
    workers[id].terminate()
    stat[id] = 0

    console.log("stat - ", stat)

    // checking status of each thread, if it is 0 for all, emit processingDone
    if(stat.reduce((total,cur) => total+cur) === 0){
        socket.emit('processingDone',data)
    }
}

// using socket here, which is connected to the namespace as done from script tag
// socket represents a single one <-> one connection
socket.on('initialze', (loc)=>{
    console.log(`Worker file located at ${loc}`)
    
    // initialize web workers equal to the number of cores
    for(let i=0; i<cores; i++){
        var myWorker = new Worker(loc)

        // web worker sends this message on execution of their algorithm
        // check worker.js for further details
        myWorker.onmessage = (response) => {

            // response => index | result | terminate ?
            // since data is 0 indexed, we need to subtract the offset
            data[response.data[0] - initData[0]] = response.data[1]

            // setting display for current status of the thread
            resultDisplay[i][0].textContent = response.data[0];
            resultDisplay[i][1].textContent = response.data[1];

            // if it is true, then number is prime
            // this can cause inconsistencies though, since multiple thread might try to access it at the same time
            // create separate total for each thread
            if(response.data[1]){
                // creating and adding div that is prime to final div on frontend
                const primeDiv = document.createElement("div")
                primeDiv.classList.add('final__data')
                primeDiv.textContent = response.data[0]
                fin.appendChild(primeDiv)
            }
            // if terminate true, then need to terminate that worker
            if(response.data[2]){
                console.log("Response - ", response.data)
                terminate(i)
            }
        }
        // onmessage over

        // push myWorker to workers array
        workers.push(myWorker)
        // set status as 1 for that worker
        stat.push(1)
    }
    console.log("Workers created as- ", workers)

    // finally created all workers, and setup onmessage handlers for them
    // ready for next call
    socket.emit('ready')
})

// At this point this data is going to be range
socket.on('range', (param)=>{

    // received current and limit upto which to calculate
    var curr = param[0]
    var limit = param[1]

    // set initData for offset calculation
    initData[0] = curr
    initData[1] = limit

    // Initialise result array
    for(let i=0 ; i < limit-curr+1; i++){
        data.push(0)
    }

    console.log(`Recieved range is ${curr} to ${limit}`)
    
    while(curr < limit){
        for(let i=0; i<cores; i++){
            // posting message to web worker
            // it catches it in it's onmessage
            // sends result back using return
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
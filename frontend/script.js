const cores = navigator.hardwareConcurrency

var primes = []
var workers = []
var stat = []
var curr = 1

for(let i=0; i<200; i++){
    primes.push(0)
}

// Worker termination
const terminate = (id) => {
    workers[id].terminate()
    stat[id] = 0

    if(stat.reduce((tot,cur) => tot + cur) === 0){
        console.log(primes)
        for(let i=0; i<primes.length; i++){
            if(primes[i]){
                console.log(i)
            }
        }
    }
}

// Worker initiation
for(let i = 0; i<cores; i++){
    stat.push(1)
    var myWorker = new Worker('./worker.js')
    myWorker.onmessage = (x) => {
        if(x.data[1]){
            primes[x.data[0]] += 1
        }
        if(x.data[2]){
            terminate(i)
        }
    }
    workers.push(myWorker)
}

// Checking primes
while(curr < 100){
    for(let i=0; i<cores; i++){
        workers[i].postMessage(curr)
        curr += 1
        curr = Math.min(curr,100)
    }

    if(curr == 100){
        for(let i=0; i<cores; i++){
            workers[i].postMessage(curr)
        }
    }
}


const express = require('express');
const app = express();

// For now sending local files, will switch to some hosted entity
// Or can even pass js file as a blob or string and create web worker
const url = "../worker.js";

let workers = 0;
app.use(express.static('public'));

server = app.listen(8080,()=>{
    console.log("listening at port 8080"); 
})

const io = require('socket.io')(server);
const range = 100
var curr = 1

io.on('connection',(socket)=>{
    workers++;
    console.log('new user joined',workers);
    socket.emit('initialze',url);
    socket.on('ready', () => {
        socket.emit('range',[curr, curr + range - 1])
        curr += range
    });
    socket.on('processingDone', (result) => {
        for(let i=0; i<result[0].length; i++){
            if(result[0][i]){
                console.log(`${i+result[1][0]} is prime`)
            }
        }
    })
});


const express = require('express');
const app = express();

// For now sending local files, will switch to some hosted entity
// Or can even pass js file as a blob or string and create web worker
const url = "worker.js";

let workers = 0;
app.use(express.static(__dirname + '/public/'));
process.env.PORT = process.env.PORT ? process.env.PORT : 8080;
console.log(process.env.PORT);
server = app.listen(process.env.PORT,()=>{
    console.log(`listening at port ${process.env.PORT}`); 
})

const io = require('socket.io')(server);
const range = 20000
var curr = 10000000

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


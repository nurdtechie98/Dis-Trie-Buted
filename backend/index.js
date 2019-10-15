const express = require('express');
const app = express();

const url = "https://gist.github.com/nurdtechie98/628fde640093d30d3ae3b62e3b711488.js";

let workers = 0;
app.use(express.static('public'));

server = app.listen(8080,()=>{
    console.log("listening at port 8080"); 
})

const io = require('socket.io')(server);

io.on('connection',(socket)=>{
    workers++;
    console.log('new user joined',workers);
    socket.emit('initialze',url);
    //socket.on('ready');
});


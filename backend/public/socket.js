let socket;
const connect = ()=>{
    socket = io.connect('http://localhost:8080');
}

connect();

socket.on('initialze',data=>{
    console.log('url: ',data);
    const script = document.createElement('script')
    script.setAttribute('src',data);
    const main = document.getElementById("hello");
    main.appendChild(script);
    socket.emit('ready');
})
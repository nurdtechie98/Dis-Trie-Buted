const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');

app.use(express.static(__dirname + '/public/'));
app.set('views', path.join(__dirname, '/views/'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: false}));

process.env.PORT = process.env.PORT ? process.env.PORT : 8080;
server = app.listen(process.env.PORT,()=>{
    console.log(`listening at port ${process.env.PORT}`); 
})
const io = require('socket.io')(server);

const getProblemsList = () => {
        const problemsListPath = path.join(__dirname, `/public/`);
        const problemsList = fs.readdirSync(problemsListPath)
        return problemsList;
}

const createNamespace = (namespace, start, end, step, url) => {

    const nsp = io.of(`/${namespace}`);

    nsp.on('connection',(socket)=>{
        console.log(`${socket.id} connected to ${namespace}`);

        var curr = start;

        // socket represents a single connection
        // nsp represents the whole namespace
        socket.emit('initialize',url);
        socket.on('ready', () => {
            console.log(`Ready received -> ${socket.id} is calculating from ${curr}`);
            socket.emit('range',curr,step);
            curr += step;
        });
        socket.on('disconnect', () => console.log(`${socket.id} disconnected`));
        socket.on('processingDone', (outputData) => {
            // outputData is according to index of the node
            // To translate to input data, we need to store somewhere current index allocated to socket
            // receiving data in division of cores
            for(let c=0; c<outputData.length; c++){
                for(let i=0; i<outputData[c].length; i++){
                    console.log(outputData[c][i]);
                }
            }
        })
    });
    
}

app.get("/", (_req,res) => {

    // get all files config
    const configsList = [];
    const problemsList = getProblemsList();
    problemsList.forEach((problem) => {
        if(fs.lstatSync(path.join(__dirname, `/public/${problem}`)).isDirectory()){
                const configPath = path.join(__dirname, `/public/${problem}/config.json`);
                const configJson = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                configsList.push(configJson);
        }
    })

    res.render("main", {config: configsList});
})

app.get("/favicon.ico", (_req,res) => res.status(204));
app.get("/robots.txt", (_req,res) => res.status(204));

app.get("/:namespace", (req,res) => {
    const namespace = req.params.namespace;
    if(fs.lstatSync(path.join(__dirname, `/public/${namespace}`)).isDirectory()){
        const configJsonPath = path.join(__dirname, `/public/${namespace}/config.json`);
        const configJson = JSON.parse(fs.readFileSync(configJsonPath, 'utf-8'));
        
        createNamespace(namespace, configJson.start, configJson.end, configJson.step, `/${namespace}/${configJson.workerURL}`);
        // create namespace for the current one
        
        console.log(configJson);
        res.render("worker",{config: configJson});
    }
    else{
        res.render("error");
    }
})




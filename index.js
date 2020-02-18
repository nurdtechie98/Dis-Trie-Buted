const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');

// Setting up express config
app.use(express.static(__dirname + '/public/'));
app.use('/static', express.static(path.join(__dirname, '/public/')))
app.set('views', path.join(__dirname, '/views/'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: false}));

process.env.PORT = process.env.PORT ? process.env.PORT : 8080;
server = app.listen(process.env.PORT,()=>{
    console.log(`listening at port ${process.env.PORT}`); 
})

// Setting up socket io
const io = require('socket.io')(server);

// Getting current problems dynamically, as they are stored in public folder
const getProblemsList = () => {
    const problemsListPath = path.join(__dirname, `/public/`);
    const problemsList = fs.readdirSync(problemsListPath)
    return problemsList;
}

const configsList = [];
const resultList = []
const problemsList = getProblemsList();
problemsList.forEach((problem) => {
    if(fs.lstatSync(path.join(__dirname, `/public/${problem}`)).isDirectory()){
        const configPath = path.join(__dirname, `/public/${problem}/config.json`);
        const configJson = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        configsList.push(configJson);
        
        if(!fs.existsSync(path.join(__dirname, `/public/${problem}/results.json`))){
            const numSegments = Math.ceil((configJson.end - configJson.start)/configJson.step);
            const answers = new Array();
            for(let i=0; i<numSegments; i++){
                answers.push(new Array());
            }
            const clients = new Array();
            const data = JSON.stringify({clients, answers});
            fs.writeFileSync(path.join(__dirname, `/public/${problem}/results.json`), data);

            resultList.push({clients, answers});
        }
    }
})

// Creating namespace, or socket communication for each problem
// Can be otpimised by checking if namespace already exists ?
const createNamespace = (namespace, start, end, step, url, readFile) => {
    
    const nsp = io.of(`/${namespace}`);
    
    nsp.on('connection',(socket)=>{
        console.log(`${socket.id} connected to ${namespace}`);
        
        var curr = start;
        
        // socket represents a single connection
        // nsp represents the whole namespace
        socket.emit('initialize',url);
        socket.on('ready', () => {
            console.log(`Ready received -> ${socket.id} is calculating from ${curr}`);
            socket.emit('range',curr,step,readFile);
            curr += step;
        });
        // Disconnect is a defualt event provided by socket
        // Can change heartbeat time period as per needs
        socket.on('disconnect', () => console.log(`${socket.id} disconnected`));
        socket.on('processingDone', (outputData) => {
            // outputData is according to index of the node
            // To translate to input data, we need to store somewhere current index allocated to socket
            // receiving data in division of cores
            
            console.log(`Processing done by ${socket.id}`);
            for(let c=0; c<outputData.length; c++){
                for(let i=0; i<outputData[c].length; i++){
                    console.log(outputData[c][i]);
                }
            }
        })
    });
    
}

// When root location hit, display all current problems available dynamically
// All current problems fetched and data extracted from config.json
// Render the main view with this dynamic data
app.get("/", (_req,res) => {
    
    // get all files config
    
    res.render("main", {config: configsList});
})

// Setting up routes for default requests, so that they do not hamper process
app.get("/favicon.ico", (_req,res) => res.status(204));
app.get("/robots.txt", (_req,res) => res.status(204));

// Finally executing some namespace, we are starting that problem
// Get config file and setup namespace for that problem
// Render the worker view, with config file
app.get("/:namespace", (req,res) => {
    const namespace = req.params.namespace;
    if(fs.lstatSync(path.join(__dirname, `/public/${namespace}`)).isDirectory()){
        const configJsonPath = path.join(__dirname, `/public/${namespace}/config.json`);
        const configJson = JSON.parse(fs.readFileSync(configJsonPath, 'utf-8'));
        
        createNamespace(namespace, configJson.start, configJson.end, configJson.step, `/${namespace}/${configJson.workerURL}`, configJson.readFile);
        // create namespace for the current one
        
        res.render("worker",{config: configJson});
    }
    else{
        res.render("error");
    }
})




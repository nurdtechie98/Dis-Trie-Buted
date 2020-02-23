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

const configDict = {}
const resultDict = {}

// Creating namespace, or socket communication for each problem
// Can be otpimised by checking if namespace already exists ?
const createNamespace = (namespace, start, end, step, url, readFile) => {
    
    const nsp = io.of(`/${namespace}`);
    
    nsp.on('connection',(socket)=>{
        console.log(`${socket.id} connected to ${namespace}`);
        
        var curr;
        // forEach loop cannot be broken out of
        for(var i=0; i<resultDict[namespace].answers.length; i++){
            if(resultDict[namespace].answers[i].length == 0){
                curr = i;
                break;
            }
        }

        // Once you get the empty one, need to mark that this step is under calculation -
        console.log(curr,"INITIAL");

        // socket represents a single connection
        // nsp represents the whole namespace
        socket.emit('initialize',url);
        socket.on('ready', () => {
            console.log(`Ready received -> ${socket.id} is calculating from ${curr}`);
            socket.emit('range',start + (curr*step) + 1,step,readFile);
            resultDict[namespace].answers[i] = [socket.id];
        });
        // Disconnect is a defualt event provided by socket
        // Can change heartbeat time period as per needs
        socket.on('disconnect', () => {
            console.log(`${socket.id} disconnected`);
            // socket.server.close();
        });
        socket.on('processingDone', (outputData) => {
            // outputData is according to index of the node
            // To translate to input data, we need to store somewhere current index allocated to socket
            // receiving data in division of cores
            
            console.log(`Processing done by ${socket.id}`);

            // Emptying the current dict, since we are marking it as underwork
            let curr;
            for(let i=0; i<resultDict[namespace].answers.length; i++){
                if(resultDict[namespace].answers[i] == socket.id){
                    curr = i;
                    break;
                }
            }

            // Outer loop is for number of cores
            for(let c=0; c<outputData.length; c++){
                for(let i=0; i<outputData[c].length; i++){
                    resultDict[namespace].answers[curr].push(outputData[c][i]);
                }
            }
            resultDict[namespace].answers.forEach((res) => {
                if(res.length > 0){
                    console.log(res.length);
                }
            });
        })
    });   
}

const problemsList = getProblemsList();

// Initial creation of configDict and resultDict which will be updated

// Update configDict when POST route hit
// Update resultDict when processingDone received

// Writing to file performed asynchronously, through chron jobs
// For config check if new key added to configDict
// For resullt for now directly write every result, later can put a flush flag or change flag

// Thus, file operations done only while initialisation and in chron jobs
// Eliminating complex thread handling issue

// TODO: Research how databases can handle mutation to same rows concurrently, like the result for a problem
problemsList.forEach((problem) => {
    if(fs.lstatSync(path.join(__dirname, `/public/${problem}`)).isDirectory()){
        const configPath = path.join(__dirname, `/public/${problem}/config.json`);
        const resultPath = path.join(__dirname, `/public/${problem}/results.json`);

        const configJson = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        configDict[configJson.id] = configJson;
        
        if(!fs.existsSync(resultPath)){
            const numSegments = Math.ceil((configJson.end - configJson.start)/configJson.step);
            const answers = new Array();
            for(let i=0; i<numSegments; i++){
                answers.push(new Array());
            }
            const clients = new Object();
            const data = JSON.stringify({clients, answers});
            fs.writeFileSync(resultPath, data);
            resultDict[configJson.id] = {clients, answers};
        }
        else{
            resultDict[configJson.id] = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
        }

        createNamespace(configJson.id, configJson.start, configJson.end, configJson.step, `/${configJson.id}/${configJson.workerURL}`, configJson.readFile);
    }
})

// When root location hit, display all current problems available dynamically
// All current problems fetched and data extracted from config.json
// Render the main view with this dynamic data
app.get("/", (_req,res) => {
    
    // get all files config
    
    res.render("main", {config: Object.values(configDict)});
})

// Setting up routes for default requests, so that they do not hamper process
app.get("/favicon.ico", (_req,res) => res.status(204));
app.get("/robots.txt", (_req,res) => res.status(204));

// Finally executing some namespace, we are starting that problem
// Get config file and setup namespace for that problem
// Render the worker view, with config file
app.get("/:namespace", (req,res) => {
    const namespace = req.params.namespace;
    if(configDict.hasOwnProperty(namespace)){
        const configJson = configDict[namespace];
        
        res.render("worker",{config: configJson});
    }
    else{
        res.render("error");
    }
})




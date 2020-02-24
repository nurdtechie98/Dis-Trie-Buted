const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const socketServer = require('./socketServer');
const createNamespace = socketServer.createNamespace;


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
            const resultJson = JSON.parse(fs.readFileSync(resultPath, 'utf-8'));
            var flag = true;
            
            for(let i=0; i<resultJson.answers.length; i++){
                if(resultJson.answers[i].length == 0){
                    flag = false;
                    break;
                }
            }

            if(!flag){
                resultDict[configJson.id] = resultJson;
                configDict[configJson.id] = configJson;
                createNamespace(io, resultDict, configJson, configDict);
            }
        }
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

cron.schedule('*/5 * * * *', () => {
    Object.keys(resultDict).forEach((key) => {
        const res = JSON.stringify(resultDict[key]);
        fs.writeFile( path.join(__dirname, `/public/${key}/results.json`), res, 'utf-8', () => console.log(`Results updated to file for ${key}`));
    })
})

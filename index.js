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
        // socket represents a single connection
        // nsp represents the whole namespace
        socket.emit('initialze',url);
        socket.on('ready', () => console.log(`${socket.id} is ready to receive arguments now`));
        socket.on('disconnect', () => console.log(`${socket.id} disconnected`));
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




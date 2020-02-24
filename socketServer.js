// Creating namespace, or socket communication for each problem
// Can be otpimised by checking if namespace already exists ?
const createNamespace = (io, resultDict, configJson, configDict) => {
    
    const namespace = configJson.id
    const start = configJson.start
    const end = configJson.end
    const step = configJson.step
    const url = `/${configJson.id}/${configJson.workerURL}`
    const readFile = configJson.readFile
    
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
        
        // All the results are taken so need to disconnect
        if(typeof curr === 'undefined'){
            socket.disconnect();
            alert("Every segment of work has been done or alloted");
            // Do not move remove entries from configJson or resultJson as might happen alloted and not done yet
        }
        else{
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
                
                resultDict[namespace].answers[curr] = []
                outputData.forEach((out) => resultDict[namespace].answers[curr].push(out))
                console.log(`Work done from ${start + (step*curr)} to ${start + (step*(curr+1))}`)
                
                resultDict[namespace].answers.forEach((res) => {
                    if(res.length > 0){
                        console.log(res.length);
                    }
                });

                // Removing entries from dictionary since work done
                if(start + (step*(curr+1)) >= end){
                    console.log(`Every segment of work done for ${namespace}`)
                    delete resultDict[namespace]
                    delete configDict[namespace]
                }
            })
        }
    });   
}

module.exports = {
    createNamespace
}
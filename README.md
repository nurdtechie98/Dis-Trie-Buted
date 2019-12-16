## Dis-Trie-Buted
Volunteer Computing Marketplace 

## Folder and File Structure

The main backend currenty constitutes of a single file - `index.js` which handles-  
1. Incoming connections for `page requests`
2. `socket communication` for range queries

Currently the project has a solo prime number calculation process, so when accessed `https://dis-trie-buted.herokuapp.com/` it directly serves `public/index.js` which is the default file to serve and contains the prime number program

## Files served

Serving from the `/public` directory, the `index.html` file.  
Whenever a problem is called, in this case `prime calcualtion` 2 basic javascript files are always served -   
1. `socket.js` - Handles the communication between the current (slave) node and the master (node)
2. `worker.js` - Which contains the algorithm or problem to be distributed across servers

## Communication signals exchanged & Flow

1. `connection` - Executed when the slave node connects for the first time to master node, using `io.connect(url)`
2. `initialize` - Once the master node receives connection request, it sends initialize request along with `url` which contains the algorithm or problem to be executed
3. `ready` - The slave node receives the algorithm from the url and creates worker threads from it and initializes other parameters, and sends a ready request to the master node
4. `range` - Finally master node sends the range of data, or the data to work on to the slave node using the range message
5. `processingDone` - When the whole range is calculated by the slave node, sends a message of `processingDone` to master node.

## To execute Locally 
Currently `process.env.PORT` is not set as `heroku` offers their own port, and we don't need to set explicitly.  
So, to run this program locally, add `process.env.PORT` variable.  
Also alter the `io.connect(...)` in `socket.js` file that is under `/public` and served to the slave node
## Dis-Trie-Buted
Volunteer Computing Marketplace 

## Folder and File Structure

### Index.js
- The main file being executed on the master node. This file handles all the routes, there are only two -> `/` and `/:namespace`.
- For the `/` route -> Parses through the current problems available dynamically and fetchs their data from `config.json` file to display on main page, and renderes `main.ejs` with that data
- For the `/:namespace` -> Handles the communication, by creating namespace for each and every problem, to differentiate between communication lines, and also passes config to the worker files, and renders `worker.ejs` which has links to the other files -> `socket.js` and `worker.js`.
- Messages exchanged are -> `connection` > `initialize` > `ready` > `range` > `processingDone`
- Note that this index.js is a common file for all sorts of problem and also it is executed ONLY on the master node, and not on the slave nodes

### Socket.js
- This is the common file executed for all problems on the slave node
- This sets up the communication channels for both, master-slave as well as web worker communication, and all of these communications are standardized for all problems, so they are common
- Generates a team of web workers, as per the number of cores on the machine, and assignes each one a set of index to work with, so effectively only communicate once with each worker, for a piece of task.
- Handles status of workers as well, and termination as well explicitly, as workers don't have any internal functions for that.
- Only pass parameters to each worker, and they generate the array of tasks to perform from that, saving communication costs

### Worker.js
- This is the file that will be different for each problem, and shall be provided by the client who needs to use our platform
- This will contain the mechanism as to how to generate the input, from the passed parameters, whether need to read from external file or generate implicitly, all done here
- The actual algorithm and what is returns, and when to message the main thread about it
- Note that once main thread receives a single message from the worker thread it is closed down, so need to send all messages at once.
- The upside is faster communication, the downside being if the node goes offline all partial work done is lost as well

### Config.json
- Provided by the client for each problem
- Contains various information as - `start`, `end`, `step`, `rewards` which helps to setup the platform

## Communication signals exchanged & Flow

1. `connection` - Executed when the slave node connects for the first time to master node, using `io.connect(url)`
2. `initialize` - Once the master node receives connection request, it sends initialize request along with `url` which contains the algorithm or problem to be executed
3. `ready` - The slave node receives the algorithm from the url and creates worker threads from it and initializes other parameters, and sends a ready request to the master node
4. `range` - Finally master node sends the range of data, or the data to work on to the slave node using the range message
5. `processingDone` - When the whole range is calculated by the slave node, sends a message of `processingDone` to master node.

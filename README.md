<p align="center">
  <a href="" rel="noopener">
 <img height=200px src="https://i.imgur.com/XmBqtv8.png" alt="Briefly-logo"></a>
</p>

<h1 align="center">Dis-Trie-Buted</h1>

<div align="center">


[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![forthebadge](https://img.shields.io/badge/uses-JS-yellow.svg?style=for-the-badge)](https://forthebadge.com)
[![forthebadge](https://img.shields.io/badge/powered_by-ethereum-blue.svg?style=for-the-badge)](https://forthebadge.com)


<h3>Volunteer Computing Marketplace</h3>

</div>

---------------------------

### Inspiration

* Vertical growth of processors has reached a limit, but we can still scale them horizontally by attaching new devices, or cloud services to quench our thirst for computing power. But this too is expensive, and can fast burn a hole in an individual’s pocket

* Here comes the concept of volunteer computing- a lot of devices in today’s world are idle, the computers in our computer labs, for example, and these idle devices can be used for our computing needs, that’s it

* Dis-Trie-Buted revolves around connecting these idle computing resource providers, to those in need, and even provide a layer of incentivization to benefit the provider, but not as expensive as cloud services, so that the solution is still viable.

---------------------------

### How does it work?
<h4> Have A Computational Problem ?</h4>
<p align="center">
    <img  height=300px alt="create task demo" src="./Create task.gif">
</p>
<ul>
  <li>Create New Task</li>
  <li>Set the Incentive</li>
  <li>Add Worker File</li>
</ul>

<h4> Have Idle Computing Power ?</h4>
<p align="center">
    <img height=300px alt="run task demo" src="./run task.gif">
</p>
<ul>
  <li>Select The Task</li>
  <li>Leave The Task Running</li>
  <li>Claim Your Incentive</li>
</ul>

----------------------------

### Folder and File Structure

#### Index.js
- The main file being executed on the master node. This file handles all the routes, there are only two -> `/` and `/:namespace`.
- For the `/` route -> Parses through the current problems available dynamically and fetchs their data from `config.json` file to display on main page, and renderes `main.ejs` with that data
- For the `/:namespace` -> Handles the communication, by creating namespace for each and every problem, to differentiate between communication lines, and also passes config to the worker files, and renders `worker.ejs` which has links to the other files -> `socket.js` and `worker.js`.
- Messages exchanged are -> `connection` > `initialize` > `ready` > `range` > `processingDone`
- Note that this index.js is a common file for all sorts of problem and also it is executed ONLY on the master node, and not on the slave nodes

#### Socket.js
- This is the common file executed for all problems on the slave node
- This sets up the communication channels for both, master-slave as well as web worker communication, and all of these communications are standardized for all problems, so they are common
- Generates a team of web workers, as per the number of cores on the machine, and assignes each one a set of index to work with, so effectively only communicate once with each worker, for a piece of task.
- Handles status of workers as well, and termination as well explicitly, as workers don't have any internal functions for that.
- Only pass parameters to each worker, and they generate the array of tasks to perform from that, saving communication costs

#### Worker.js
- This is the file that will be different for each problem, and shall be provided by the client who needs to use our platform
- This will contain the mechanism as to how to generate the input, from the passed parameters, whether need to read from external file or generate implicitly, all done here
- The actual algorithm and what is returns, and when to message the main thread about it
- Note that once main thread receives a single message from the worker thread it is closed down, so need to send all messages at once.
- The upside is faster communication, the downside being if the node goes offline all partial work done is lost as well

#### Config.json
- Provided by the client for each problem
- Contains various information as - `start`, `end`, `step`, `rewards` which helps to setup the platform

---------------------

### Communication signals exchanged & Flow

1. `connection` - Executed when the slave node connects for the first time to master node, using `io.connect(url)`
2. `initialize` - Once the master node receives connection request, it sends initialize request along with `url` which contains the algorithm or problem to be executed
3. `ready` - The slave node receives the algorithm from the url and creates worker threads from it and initializes other parameters, and sends a ready request to the master node
4. `range` - Finally master node sends the range of data, or the data to work on to the slave node using the range message
5. `processingDone` - When the whole range is calculated by the slave node, sends a message of `processingDone` to master node.

------------

### Created by

* Neel Shah - [nilshah98](https://github.com/nilshah98)
* Shivam Pawase - [shivam1708](https://github.com/shivam1708)
* Chirag Shetty - [nurdtechie98](https://github.com/nurdtechie98)


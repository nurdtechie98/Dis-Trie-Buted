const Web3 = require('web3');


var accounts;
var contract;

window.onload = async () => {
    if(typeof web3 !== 'undefined'){
        web3 = new Web3(web3.currentProvider);
    } 
    else{
        console.log("Here!!");
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    var abi = [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "name": "payee",
                    "type": "address"
                }
            ],
            "name": "withdraw",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "problemToIncentive",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "name": "incentive",
                    "type": "uint256"
                },
                {
                    "name": "payee",
                    "type": "address"
                }
            ],
            "name": "deposit",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "deposits",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256"
                }
            ],
            "name": "getIncentive",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "problemToBuyer",
            "outputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        }
    ]; 
    
    var address = '0x2a6fb74a957ccf52fa1ded96f40afe86ac8e6986';
    accounts = await web3.eth.getAccounts();
    contract = new web3.eth.Contract(abi,address);
    console.log(contract);
}


window.getIncentive = async (id) => {
    var incentive = await contract.methods.getIncentive(id).call(
        {
            from: accounts[0],
            gas: '4700000'
        }
    )
    //return series_address;
    console.log(incentive);
}


//get_incentive(123);
// // give both arrays of ipfs hashes and public address of students.
// var addcertificates = async (arr1, arr2) => {
//     await newcontract.methods.addcertificates(arr1, arr2).send(
//         {
//             from: accounts[0],
//             gas: '4700000'
//         }
//     )
// }
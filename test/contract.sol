pragma solidity >=0.4.22 <0.6.0;

contract Escrow
{
    mapping (uint256 => address) public problemToBuyer;
    mapping (uint256 => uint256) public problemToIncentive;
    mapping (uint256 => uint256) public deposits;
    
    modifier onlyAgent(address payee) {
        require(msg.sender == payee);
        _;
    }
    
    constructor () public {
    
    }
    
    function deposit(uint256 id, uint256 incentive, address payee) public onlyAgent(payee) payable {
        uint256 amount = msg.value;
        deposits[id] = amount;
        problemToBuyer[id] = payee;
        problemToIncentive[id] = incentive;
    }
    
    function withdraw(uint256 id, address payable payee) public {
        uint256 payment = problemToIncentive[id];
        if(deposits[id] > 0)
        {
            deposits[id] = deposits[id] - payment;
            payee.transfer(payment);   
        }
    }
    
    function getIncentive(uint256 id) public view returns (uint256){
        return problemToIncentive[id];
    }
}
const form = document.querySelector('form');

function test() {
    const problem_name = document.getElementById('problem_name');
    console.log(problem_name.value.trim());
    if(!problem_name.value.trim()){
        console.log("345678")
        problem_name.style.background = "rgba(255,0,0,0.6)";
        problem_name.placeholder = "Empty name not allowed";
        setTimeout(() => {
            problem_name.style.background = "#1F2739";
            problem_name.placeholder = "Task Name";  
        },8000)
        document.getElementById('prev2').click();
    }
}

function test2() {
    const public_address = document.getElementById('public_address');
    const reward = document.getElementById('reward');
    if(!isAddress(public_address.value.trim())){
        console.log("101010")
        public_address.style.background = "rgba(255,0,0,0.6)";
        public_address.value = "";
        public_address.placeholder = "Ethereum public address not valid";
        setTimeout(() => {
            public_address.style.background = "#1F2739";
            public_address.placeholder = "Public Address of Uploader";  
        },8000)
        document.getElementById('prev3').click();
    }
    console.log("bdkhf")
    if(!checkDecimal(reward.value)){
        console.log("djhnkdf")
        reward.style.background = "rgba(255,0,0,0.6)";
        reward.value = "";
        reward.placeholder = "Only decimal entry allowed";
        setTimeout(() => {
            reward.style.background = "#1F2739";
            reward.placeholder = "Public Address of Uploader";  
        },8000)
        document.getElementById('prev3').click();
    }
}

function test3() {
    const start = document.getElementById('start');
    const end = document.getElementById('end');
    const jobs = document.getElementById('jobs');
    let state = false;
    if(isInteger(start.value.trim())){
        start.style.background = "rgba(255,0,0,0.6)";
        start.value = "";
        start.placeholder = "Only integer entry allowed";
        setTimeout(() => {
            start.style.background = "#1F2739";
            start.placeholder = "Start value";  
        },8000)
        document.getElementById('prev4').click();
        state = true;
    }
    if(isInteger(end.value.trim())){
        end.style.background = "rgba(255,0,0,0.6)";
        end.value = "";
        end.placeholder = "Only integer entry allowed";
        setTimeout(() => {
            end.style.background = "#1F2739";
            end.placeholder = "End value";  
        },8000)
        document.getElementById('prev4').click();
        state = true;
    }
    if(isInteger(jobs.value.trim())){
        jobs.style.background = "rgba(255,0,0,0.6)";
        jobs.value = "";
        jobs.placeholder = "Only integer entry allowed";
        setTimeout(() => {
            jobs.style.background = "#1F2739";
            jobs.placeholder = "No of jobs";  
        },8000)
        document.getElementById('prev4').click();
    }
    else if(parseInt(jobs.value.trim()) <= 0){
        jobs.style.background = "rgba(255,0,0,0.6)";
        jobs.value = "";
        jobs.placeholder = "Only positive integer entry allowed";
        setTimeout(() => {
            jobs.style.background = "#1F2739";
            jobs.placeholder = "No of jobs";  
        },8000)
        document.getElementById('prev4').click();
    }
    if(state === false){
        if(parseInt(start.value) >= parseInt(end.value)){
            end.style.background = "rgba(255,0,0,0.6)";
            end.value = "";
            end.placeholder = "End value should be bigger than start value";
            setTimeout(() => {
                end.style.background = "#1F2739";
                end.placeholder = "End value";  
            },8000)
            document.getElementById('prev4').click();
        }
    }
}

function isInteger(characters) {
    var charactersLength = characters.length;
    var numbers = '0123456789';
    console.log(characters);
    if(characters.charAt(0)=== '+' || characters.charAt(0)=== '-' || numbers.includes(characters.charAt(0))){
        
    }
    else
        return true
    for ( var i = 1; i < charactersLength; i++ ) {
        if(!numbers.includes(characters.charAt(i))){
            return true
        }
    }
    return false;
 }

function checkDecimal(inputtxt) 
{ 
    var decimal=  /^[-+]?[0-9]+\.[0-9]+$/; 
    if(inputtxt.match(decimal)) { 
        return true;
    }
    else{ 
        return false;
    }
} 

function isAddress(address) {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else {
        return true;
    }
};

function makeid(length) {
    var result           = '';
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    var formData = new FormData(form);
    const start = parseInt(formData.get("start"));
    const end = parseInt(formData.get("end"));
    const jobs = parseInt(formData.get("jobs"));
    const step = `${Math.ceil((end - start) / jobs)}`;

    // Need to call the contract function here
    const seriesId = makeid(12);
    formData.append("seriesId",seriesId);
    const publicAddress = formData.get("supplier");
    const incentive = ''+BigInt(Number(1000000000000000000)*Number(formData.get("reward_per_user")));
    formData.append("step",step);
    formData.append("reward",incentive);
    const val = ''+(BigInt(jobs)*BigInt(incentive));

    console.log(seriesId,publicAddress,incentive,val);

    await deposit(seriesId,incentive,publicAddress,val);

    alert("Contract created!");

    console.log(`Contract at ${seriesId} by ${publicAddress} for ${incentive} for each step, total steps are ${val}`);

    await fetch("/addFile", {
        method: 'POST',
        body: formData
    });

    alert("Problem has been created!, move to home page");
})

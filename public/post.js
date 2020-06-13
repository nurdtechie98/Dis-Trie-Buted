const form = document.querySelector('form');

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
    const incentive = formData.get("reward");
    formData.append("step",step)
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

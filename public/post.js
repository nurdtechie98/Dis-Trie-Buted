const form = document.querySelector('form');

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    var formData = new FormData(form);
    const start = parseInt(formData.get("start"));
    const end = parseInt(formData.get("end"));
    const step = parseInt(formData.get("step"));

    // Need to call the contract function here
    const seriesId = formData.get("seriesId");
    const publicAddress = formData.get("supplier");
    const incentive = formData.get("reward");
    const steps = `${Math.ceil((end - start) / step)}`;
    const val = ''+(BigInt(steps)*BigInt(incentive));

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

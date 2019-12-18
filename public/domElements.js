const cores = navigator.hardwareConcurrency

// for displaying status of each thread ->
var resultDisplay = []

const resContainer = document.getElementsByClassName("result")[0];
const fin = document.getElementsByClassName("final")[0];

// creating elements that hold result for each thread
for(let i=0; i<cores; i++){
    let resRow = document.createElement("div")
    resRow.classList.add(`result__row`)
    resRow.id = `result__row--${i}`
    let resRowThread = document.createElement("div");
    let resRowData = document.createElement("div");
    let resRowStatus = document.createElement("div");

    resRowThread.classList.add(`result__thread`)
    resRowData.classList.add(`result__data`)
    resRowStatus.classList.add(`result__status`)

    resRowThread.textContent = `${i+1}`

    resRow.appendChild(resRowThread)
    resRow.appendChild(resRowData)
    resRow.appendChild(resRowStatus)

    resContainer.appendChild(resRow)

    // storing them in resultDisplay to alter it's contents next
    resultDisplay.push([resRowData, resRowStatus])
}

export {cores, resultDisplay, fin}
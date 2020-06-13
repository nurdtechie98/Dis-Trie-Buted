let times = (...matrices) =>	
  matrices.reduce(	
    ([a,b,c], [d,e,f]) => [a*d + b*e, a*e + b*f, b*e + c*f]	
  );	

let power = (matrix, n) => {	
  if (n === 1) return matrix;	

  let halves = power(matrix, Math.floor(n / 2));	

  return n % 2 === 0	
         ? times(halves, halves)	
         : times(halves, halves, matrix);	
}	

let fibonacci = (n) =>	
  n < 2	
  ? [n,n]	
  : [n,power([1, 1, 0], n - 1)[0]];	

// receive parameters for the algorithm, from socket.js	
onmessage = (e) => {	
    // e.data -> start | step | fileLoc	
    // Need to create input data	
    var inputData = []	

    if(e.data[2]){	
        // Creating input data from certain file	
    }	
    else{	
        // Creating input data on your own	
        for(let i=e.data[0]; i<(e.data[0] + e.data[1]); i++){	
            inputData.push(i);	
        }	
    }	

    // Now creating an outputData array	
    var outputData = []	

    // This is calculated synchronously, since single threaded	
    inputData.forEach((data) => outputData.push(fibonacci(data)))	

    // Finally output message on mainThread once calculations done	
    postMessage(outputData);	
} 
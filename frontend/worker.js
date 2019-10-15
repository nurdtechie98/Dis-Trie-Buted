importScripts('./primes.js')
onmessage = (e) => postMessage(checkPrime(e.data))
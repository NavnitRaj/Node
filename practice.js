// const https = require('https');
// for(let i=0;i<25;i++){
//     let url = "https://jsonmock.hackerrank.com/api/countries?page="+i;
//     https.get(url, (resp) => {
//     let data = '';
//     resp.on('data', (chunk) => {
//         data += chunk;
//     });
//     resp.on('end', () => {
//         let parsedData = JSON.parse(data);
//         for(let d in parsedData.data){
//             if(parsedData.data[d].alpha2Code == "CH"){
//                 console.log(parsedData.data[d]);
//             }
//         }
//     });
//     });
// }


'use strict';

const fs = require('fs');

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', function(inputStdin) {
    inputString += inputStdin;
});

process.stdin.on('end', function() {
    inputString = inputString.split('\n');

    main();
});

function readLine() {
    return inputString[currentLine++];
}

/*
 * Complete the 'sockMerchant' function below.
 *
 * The function is expected to return an INTEGER.
 * The function accepts following parameters:
 *  1. INTEGER n
 *  2. INTEGER_ARRAY ar
 */

function sockMerchant(n, ar) {
    // Write your code here
    let element = [] ;
    let counter = {};
    for(let i=0;i<n;i++){
        if(element.ar){
            ar[0]++;
        }
        else{
            let b= ar[i];
            counter.ar = ar[i];
            counter.count = 0;
            element.push(counter);
        }
    }
    console.log(element);

}

function main() {
    

    const result = sockMerchant(9, [10,20,20,10,10,30,50,10,20]);


    ws.end();
}

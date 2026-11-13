import assert from 'node:assert/strict';
let checked=0;for(const slug of ['connecticut','north-carolina','indiana'])for(const path of ['practice/','study-guide/','guides/example/']){const response=await fetch('http://127.0.0.1:3461/'+slug+'/'+path);assert.equal(response.status,404,slug+'/'+path);checked++;}console.log(`Production configuration HTTP gates passed: ${checked} candidate routes`);

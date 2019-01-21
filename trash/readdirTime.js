// test the time for get the count of files in a dir with 2500 files
const fs = require('fs');
const path = 'C:/Users/libor/bachelor-node/images/2582_sub_wikiarts/';

console.time('count');
fs.readdir(path, (err, files)=>{
    if(err) console.error(err)
    console.log(files.length)
    console.timeEnd('count')
})

// 105 files (15 are folders): 14ms
// 2597 files (15 are folders): 15ms

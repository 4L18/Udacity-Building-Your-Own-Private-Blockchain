/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
function addLevelDBData(key,value) {
  return new Promise((resolve, reject) => {
    db.put(key, value, function(err) {
      if (err) reject('Block ' + key + ' submission failed', err);
      resolve('Block ' + key + ' added successfully');
    })
  });
}

// Get data from levelDB with key
function getLevelDBData(key) {
  return new Promise((resolve, reject) => {
    db.get(key, function(err, value) {
      if (err) reject('Not found!', err);
      resolve(value);
    })
  })
}

// Add data to levelDB with value
function addDataToLevelDB(value) {
  let i = 0;
  db.createReadStream()
  .on('data', function(data) {
    i++;
  })
  .on('error', function(err) {
    return console.log('Unable to read data stream!', err)
  })
  .on('close', function() {
    console.log('Block #' + i);
    addLevelDBData(i, value);
  });
}

function getBlocksCount() {
  return new Promise((resolve, reject) => {
    let count = -1;
    db.createReadStream()
    .on('data', function (data) {
      count++;
    })
    .on('error', function (err) {
      console.log('Oh my!', err)
    })
    .on('close', function () {
      //console.log('Stream closed')
    })
    .on('end', function () {
      //console.log('Stream ended')
      resolve(count);
    });
  });
}

function getBlockByHash(hash) {
  return new Promise(function(resolve, reject) {
    let block;
    db.createReadStream()
    .on('data', function (data) {
      block = JSON.parse(data.value);
      if (block.hash == hash) {
        return;
      }
    })
    .on('error', function (err) {
      reject(err)
    })
    .on('close', function () {
      resolve(block);
    });
  });
}
module.exports = {addLevelDBData, getLevelDBData, getBlocksCount, getBlockByHash}
/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/


/*(function theLoop (i) {
  setTimeout(function () {
    addDataToLevelDB('Testing data');
    if (--i) theLoop(i);
  }, 100);
})(10);*/
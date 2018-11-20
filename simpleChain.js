/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|========================================================== */

const SHA256 = require('crypto-js/sha256');
const levelSandbox = require('./levelSandbox');
const block = require('./block');


/* ===== Blockchain Class ===========================
|  Class with a constructor for new blockchain 	  	|
|================================================= */

class Blockchain{

  constructor() {
    if (!this.genesisBlockExists()) {
      createGenesisBlock();
    }
  }

  // This method is done because I'm yet to know a better way to call an async
  //  function from the constructor that belongs to the class
  async genesisBlockExists() {
    let height = await this.getBlockHeight();
    if (height === -1) { return false; }
    return true;
  }

  // Add de genesis block 
  async createGenesisBlock() {
    console.log('Block #0 - Genesis block');
    let genBlock = await new block.Block('Block #0 - Genesis block');
    console.log('Height: ', genBlock.height);
    genBlock.time = await new Date().getTime().toString(); //.slice(0,-3);
    console.log('Timestamp: ', genBlock.time);
    genBlock.hash = await SHA256(JSON.stringify(genBlock)).toString();
    console.log('Hash: ', genBlock.hash);
    let res = await levelSandbox.addLevelDBData(genBlock.height, JSON.stringify(genBlock).toString());
    console.log(res + '\n');
  }

  // Add new block
  async addBlock(newBlock) {

    if (!this.genesisBlockExists()) {
      createGenesisBlock();
    }

    console.log(newBlock.body);

    // Block height
    let height = await this.getBlockHeight();
    newBlock.height = ++height;
    console.log('Height: ', newBlock.height);
    
    // UTC timestamp
    newBlock.time = await new Date().getTime().toString(); //.slice(0,-3);
    console.log('Timestamp: ', newBlock.time);

    // Previous block hash
    if (newBlock.height > 0) {
      let previousBlock = JSON.parse(await this.getBlock(height-1));
      newBlock.previousBlockHash = previousBlock.hash;
    }
    console.log('Previous block hash: ', newBlock.previousBlockHash);

    // Block hash with SHA256
    newBlock.hash = await SHA256(JSON.stringify(newBlock)).toString();
    console.log('Hash: ', newBlock.hash);
    
    // Adding block to chain
    let res = await levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());
    console.log(res + '\n');
  }

  // Get block height
  async getBlockHeight() {
    return await levelSandbox.getBlocksCount();
  }

  // Get block
  async getBlock(blockHeight) {
    // return object as a single string
    let block = await levelSandbox.getLevelDBData(blockHeight);
    return block;
  }

  // Validate block
  async validateBlock(blockHeight) {
    // get block object
    let block = JSON.parse(await this.getBlock(blockHeight));
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    let validBlockHash = await SHA256(await JSON.stringify(block)).toString();
    
    if (blockHash === validBlockHash) {
        return true;
      } else {
        console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
        return false;
      }
  }

  // Validate blockchain
  async validateChain() {
    let height = await levelSandbox.getBlocksCount();
    let promisesBlock = [];
    let promisesLink = [];
    let errorLog = [];

    let linkPromise = (index, blockchain) => {
      return new Promise(async function(resolve, reject) {
        let block = await blockchain.getBlock(index);
        let blockHash = block.hash;

        let nextBlock = await blockchain.getBlock(index+1);
        let nextBlockPreviousHash = nextBlock.previousBlockHash;

        if (blockHash !== nextBlockPreviousHash) {
            reject(index);
        }

        resolve();
      });
    };

    for (var i = 0; i < height-1; i++) {
      promisesBlock.push(this.validateBlock(i));
      promisesLink.push(linkPromise(i, this));
    }

    Promise.all(promisesBlock)
    .then()
    .catch(index => errorLog.push(index));

    Promise.all(promisesLink)
    .then()
    .catch(index => errorLog.push(index));

    if (errorLog.length > 0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: '+ errorLog);
    } else {
      console.log('No errors detected');
    }
  }

  async addBlocksAndTest() {

    if (await this.getBlockHeight() === -1) {
      await this.createGenesisBlock();
    }

    for (let i = 1; i <= 9; i++) {
      await bc.addBlock(new block.Block('Block #' + i));
      //await bc.validateBlock(i);
    }
    bc.validateChain();
  }
}


let bc = new Blockchain();
setTimeout(async () => await bc.addBlocksAndTest(), 1000);
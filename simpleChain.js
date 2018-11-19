/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|========================================================== */

const SHA256 = require('crypto-js/sha256');
const levelSandbox = require('./levelSandbox');

/* ===== Block Class ===============================
|  Class with a constructor for block 		    	   |
|================================================ */

class Block{
	constructor(data){
    this.hash = "",
    this.height = 0,
    this.body = data,
    this.time = 0,
    this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ===========================
|  Class with a constructor for new blockchain 	  	|
|================================================= */

class Blockchain{
  
  constructor() {
    let genesisBlockExists = false;
  }

  async createGenesisBlock() {
    this.genesisBlockExists = true;
    await this.addBlock(new Block("Block #0 - Genesis block"));
  }

  // Add new block
  async addBlock(newBlock) {

    if (!this.genesisBlockExists) {
      await this.createGenesisBlock();
    }

    console.log(newBlock.body);

    // Block height
    let height = await this.getBlockHeight();
    newBlock.height = height;
    console.log('Height: ', newBlock.height);
    
    // UTC timestamp
    newBlock.time = await new Date().getTime().toString(); //.slice(0,-3);
    console.log('Timestamp: ', newBlock.time);

    // Previous block hash
    if(height > 0) {
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
    if (!this.genesisBlockExists) {
      await this.createGenesisBlock();
    }
    return await levelSandbox.getBlocksCount();
  }

  // Get block
  async getBlock(blockHeight) {
    if (!this.genesisBlockExists) {
      await this.createGenesisBlock();
    }
    // return object as a single string
    let block = await levelSandbox.getLevelDBData(blockHeight);
    return block;
  }

  // Validate block
  async validateBlock(blockHeight) {
    if (!this.genesisBlockExists) {
      await this.createGenesisBlock();
    }

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
    if (!this.genesisBlockExists) {
      await this.createGenesisBlock();
    }

    let height = await levelSandbox.getBlocksCount();
    let promisesBlock = [];
    let promisesLink = [];
    let errorLog = [];

    let linkPromise = (index, blockchain) => {
      return new Promise(async function(resolve, reject)
        {
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

    if (!this.genesisBlockExists) {
      await this.createGenesisBlock();
    }

    for (let i = 1; i <= 9; i++) {
      await bc.addBlock(new Block('Block #' + i));
      //await bc.validateBlock(i);
    }
    bc.validateChain();
  }
}


let bc = new Blockchain();
setTimeout(async () => await bc.addBlocksAndTest(), 1000);
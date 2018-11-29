/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|========================================================== */

const block = require('./block');
const SHA256 = require('crypto-js/sha256');
const levelSandbox = require('./levelSandbox');

/* ===== Blockchain Class =======================
|  Class with a constructor for new blockchain  |
|============================================= */

class Blockchain {

  constructor() {
    this.genesisBlockExists().then(exists => {
      if (!exists) {
        this.createGenesisBlock();
      }
    });
  }

  genesisBlockExists() {
    return this.getBlockHeight().then(height => {
      if (height === -1) { return false; }
      return true;
    });
  }

  // Add de genesis block 
  async createGenesisBlock() {
    console.log('Block #0 - Genesis block');
    let genBlock = await new block.Block('Block #0 - Genesis block');
    console.log('Height: ', genBlock.height);
    genBlock.time = new Date().getTime().toString();
    console.log('Timestamp: ', genBlock.time);
    genBlock.hash = SHA256(JSON.stringify(genBlock)).toString();
    console.log('Hash: ', genBlock.hash);
    let res = await levelSandbox.addLevelDBData(genBlock.height, JSON.stringify(genBlock));
    console.log(res + '\n');
  }

  // Add new block
  async addBlock(newBlock) {

    if (!this.genesisBlockExists()) {
      await createGenesisBlock();
    }

    console.log(newBlock.body);

    // Block height
    let height = await this.getBlockHeight();
    newBlock.height = ++height;
    console.log('Height: ', newBlock.height);
    
    // UTC timestamp
    newBlock.time = new Date().getTime().toString();
    console.log('Timestamp: ', newBlock.time);

    // Previous block hash
    if (newBlock.height > 0) {
      let previousBlock = JSON.parse(await this.getBlock(height-1));
      newBlock.previousBlockHash = previousBlock.hash;
    }
    console.log('Previous block hash: ', newBlock.previousBlockHash);

    // Block hash with SHA256
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    console.log('Hash: ', newBlock.hash);
    
    // Adding block to chain
    let res = await levelSandbox.addLevelDBData(newBlock.height, JSON.stringify(newBlock));
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
    let validBlockHash = SHA256(await JSON.stringify(block)).toString();
    
    if (blockHash !== validBlockHash) {
      console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
      return false;
    }
    console.log('Block #' + blockHeight + ' is valid');
    return true;
  }

  // Validate blockchain
  async validateChain() {
    let chainSize = await levelSandbox.getBlocksCount();
    let promisesBlock = [];
    let promisesLink = [];
    let errorLog = [];

    let linkPromise = (index, blockchain) => {
      return new Promise(async function(resolve, reject) {
        if (index < chainSize) {
          let block = await blockchain.getBlock(index);
          let blockHash = block.hash;

          let nextBlock = await blockchain.getBlock(index+1);
          let nextBlockPreviousHash = nextBlock.previousBlockHash;

          if (blockHash !== nextBlockPreviousHash) {
              reject(index);
          }
          console.log('Block #' + index + ' is linked to previous block #' + (index+1));
          resolve();
        }
      });
    };

    for (let i = 0; i <= chainSize; i++) {
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
      return false;
    } else {
      console.log('No errors detected');
      return true;
    }
  }
}

let bc = new Blockchain();
module.exports.Blockchain = Blockchain;
const simpleChain = require('./simpleChain.js');
const block = require('./block');
const SHA256 = require('crypto-js/sha256');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.blocks = new simpleChain.Blockchain();
        this.getBlockByIndex();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.app.get("/block/:index", async (req, res) => {
            // Add your code here
            if(req.params.index) {
                const index = req.params.index;
                const block = await this.blocks.getBlock(index);
                if(block) {
                    return res.status(200).json(block);
                }
            } else {
                return res.status(404).send("Block Not Found");
            }
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/block", async (req, res) => {
            // Add your code here
            let newBlock = new block.Block(req.body.body);
            let height = await this.blocks.getBlockHeight();
            newBlock.height = height;
            newBlock.time = new Date().getTime().toString();
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            let previousBlock = JSON.parse(await this.blocks.getBlock(height-1));
            newBlock.previousBlockHash = previousBlock.hash;
            this.blocks.addBlock(newBlock);
            return res.status(200).json(newBlock);
        });
    }
}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}
const simpleChain = require('./simpleChain');
const block = require('./block');
const SHA256 = require('crypto-js/sha256');
const mempool = require('./mempool');

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
        this.mempool = new mempool.Mempool();
        this.getBlockByIndex();
        this.postNewBlock();
        this.requestValidation();
    }

    getBlockByIndex() {
        this.app.get("/block/:index", async (req, res) => {
            var index = req.params.index;
            if(index && !isNaN(index)) {
                const index = req.params.index;
                try {
                    const block = await this.blocks.getBlock(index);
                    return res.status(200).send(JSON.parse(block));
                } catch (error) {
                    let errorResponse = {
                        "status": 404,
                        "message": 'Block Not Found'
                    }
                    return res.status(404).send(errorResponse)
                }
            }
            let errorResponse = {
                "status": 400,
                "message": 'Bad Request'
            }
            return res.status(400).send(errorResponse);
        });
    }

    postNewBlock() {
        this.app.post("/block", async (req, res) => {
            let body = req.body.body;
            if (body == undefined || body === '') {
                let errorResponse = {
                    "status": 400,
                    "message": 'Body can\'t be empty'
                }
                return res.status(400).send(errorResponse);
            }
            let newBlock = new block.Block(body);
            let height = await this.blocks.getBlockHeight();
            let previousBlock = JSON.parse(await this.blocks.getBlock(height));
            newBlock.previousBlockHash = previousBlock.hash;
            newBlock.height = ++height;
            newBlock.time = new Date().getTime().toString();
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
            this.blocks.addBlock(newBlock);
            return res.status(200).json(newBlock);
        });
    }

    requestValidation() {
        this.app.post("/requestValidation", async (req, res) => {
            
            let address = req.body.address;
            let timestamp = new Date().getTime().toString();

            if (address == undefined || address === '') {
                let errorResponse = {
                    "status": 400,
                    "message": 'No address has been provided'
                }
                return res.status(400).json(errorResponse);
            }

            try {
                let requestObject = await this.mempool.addRequestValidation(address, timestamp);
                let response = {
                    "status": 200,
                    "message": requestObject
                }
                return res.status(200).json(response);
            } catch (error) {
                console.log('error', error);
                let errorResponse = {
                    "status": 400,
                    "message": error
                }
                return res.status(400).json(errorResponse);
            }
        });
    }
}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}
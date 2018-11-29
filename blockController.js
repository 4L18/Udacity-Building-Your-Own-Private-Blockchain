const block = require('./block');
const blockchain = require('./blockchain');
const levelSandbox = require('./levelSandbox');
const mempool = require('./mempool');
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
        this.blocks = new blockchain.Blockchain();
        this.mempool = new mempool.Mempool();
        this.getBlockByIndex();
        this.getBlockByHash();
        this.getBlockByAddress();
        this.postNewBlock();
        this.requestValidation();
        this.validate();
    }

    getBlockByIndex() {
        this.app.get("/block/:index", async (req, res) => {
            let index = req.params.index;
            if(index && !isNaN(index)) {
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

    getBlockByHash() {
        this.app.get("/stars/hash:hash", async (req, res) => {
            let hashRequested = req.params.hash;
            try {
                const block = await levelSandbox.getBlockByHash(hashRequested);
                return res.status(200).json(block);
            } catch (error) {
                console.log(error);
                let errorResponse = {
                    "status": 404,
                    "message": 'Block Not Found'
                }
                return res.status(404).send(errorResponse)
            }
        });
    }

    getBlockByAddress() {
        this.app.get("/stars/address:address", async (req, res) => {
            let addressRequested = req.params.address;
            try {
                const block = await levelSandbox.getBlockByHash(addressRequested);
                return res.status(200).json(block);
            } catch (error) {
                console.log(error);
                let errorResponse = {
                    "status": 404,
                    "message": 'Block Not Found'
                }
                return res.status(404).send(errorResponse)
            }
        });
    }

    postNewBlock() {
        this.app.post("/block", async (req, res) => {
            
            try {
                let body = req.body;
                if (body == undefined || body === '') {
                    throw 'Body can\'t be empty'
                }

                if (!this.requestIsValid(body)) {
                    throw 'Invalid request'
                }

                let data = {
                    "address": body.address,
                    "star": {
                        "ra": body.star.ra,
                        "dec": body.star.dec,
                        "mag": body.star.mag,
                        "cen": body.star.cen,
                        "story": Buffer(body.star.story).toString('hex'),
                    }
                };

                let newBlock = new block.Block(data);
                await this.blocks.addBlock(newBlock);
                newBlock = await this.blocks.getBlock(await this.blocks.getBlockHeight());
                return res.status(200).json(JSON.parse(newBlock));
            } catch (error) {
                let errorResponse = {
                    "status": 400,
                    "message": error
                }
                return res.status(400).json(errorResponse);
            }
        });
    }

    async requestIsValid(body) {
        try {
            if (!body.star.story) {
                throw 'Your story seems to be empty, please double check.';
            }
            let isASCII = /^[\x00-\x7F]*$/.test(body.star.story)
            if (!isASCII) {
                throw "Your story should contain only ASCII characters!";
            }
            let storyTooLong = body.star.story.length > 500 ? true : false
            if (storyTooLong) {
                throw 'Your story exceeds the limit of 250 words';
            }
            let addressIsVerified = await this.mempool.verifyAddressRequest(body.address);
            if (!addressIsVerified) {
                throw 'Address has not been verified';
            }
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    requestValidation() {
        this.app.post("/requestValidation", async (req, res) => {

            try {
                let address = req.body.address;
                let timestamp = new Date().getTime().toString();
                if (address == undefined || address === '') {
                    throw 'No address has been provided'
                }
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

    validate() {
        this.app.post("/message-signature/validate", async (req, res) => {
            
            try {
                let address = req.body.address;
                let signature = req.body.signature;           
                if (address == undefined || address === '' ||
                    signature == undefined || signature === '') {

                    throw "The address or the signature is empty or wrong formated"
                }
                let requestResponse = await this.mempool.validateRequestByWallet(address, signature);
                if (typeof requestResponse === 'string') {

                    throw requestResponse;
                }
                let response = {
                    "status": 200,
                    "message": requestResponse
                }
                return res.status(200).json(response);

            } catch (error) {
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
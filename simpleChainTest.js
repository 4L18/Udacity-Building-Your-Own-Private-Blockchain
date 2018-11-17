const simpleChain = require('./simpleChain.js');
var Jasmine = require('jasmine');
var jasmine = new Jasmine();

jasmine.loadConfigFile('spec/support/jasmine.json');
jasmine.execute();

describe("simpleChain", function() {
    let chain;

    it ("should add the genesis block when create a new blockchain", function() {
        chain = new blockchain();

        let height = chain.getBlockHeigth;
        expect(height).toEqual(0);

        let genBlock = chain.getBlock(height);
        expect(genBlock.hash).not.toEqual("");
        expect(genBlock.height).toEqual(0);
        expect(genBlock.body).toEqual("First block in the chain - Genesis block");
        expect(genBlock.time).not.toEqual(0);
        expect(genBlock.previousBlockHash).toEqual("");
    });

    it ("should add a new block", function() {
        let testBlock = new testBlock("testBlock");
        chain.addBlock();
    });
})
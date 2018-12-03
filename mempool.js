const bitcoinMessage = require('bitcoinjs-message'); 

class Mempool {
    
    constructor() {
        this.timeoutRequestsWindowTime = 5*60*1000;
        this.validationRequests = [];
        this.validationRequestsTimeouts = [];
        this.validatedRequests = [];
        this.validatedRequestsTimeouts = [];
    }

    addRequestValidation(wallet, timestamp) {
        
        let request = this.validationRequests.find(req => {
            return req.walletAddress === wallet;
        });

        let requestObject = {
            "walletAddress": "",
            "requestTimeStamp": "",
            "message": "",
            "validationWindow": ""
        }

        if (request === undefined) {
            // request does not exist. push it
            requestObject.walletAddress = wallet;
            requestObject.requestTimeStamp = timestamp;
            requestObject.message = `${wallet}:${timestamp}:starRegistry`;
            requestObject.validationWindow = this.timeoutRequestsWindowTime;

            this.validationRequests.push(requestObject);
            this.validationRequestsTimeouts.push(setTimeout(() => {
                this.removeValidationRequest(wallet)
            }, this.timeoutRequestsWindowTime));

        } else {
            // request alreayd exists. update timeout
            requestObject.walletAddress = request.walletAddress;
            requestObject.requestTimeStamp = request.requestTimeStamp;
            requestObject.message = `${request.walletAddress}:${request.requestTimeStamp}:starRegistry`;
            requestObject.validationWindow = this.calculateTimeLeft(request.requestTimeStamp);
        }
        return requestObject;
    }

    removeValidationRequest(walletAddress) {
        let addressIndex = this.validationRequests.indexOf(walletAddress);
        this.validationRequests.splice(addressIndex, 1);
        this.validationRequestsTimeouts.splice(addressIndex, 1);
    }

    calculateTimeLeft(timestamp) {
        let timeElapse = new Date().getTime().toString() - timestamp;
        let timeLeft = this.timeoutRequestsWindowTime - timeElapse;
        return timeLeft;
    }

    validateRequestByWallet(wallet, signature) {

        let requestIndex = this.validationRequests.findIndex(req => {
            return req.walletAddress === wallet;
        });

        if (requestIndex === -1) {
            return 'Your request has expired';
        }

        this.validationRequestsTimeouts.splice(requestIndex, 1);
        let req = this.validationRequests.splice(requestIndex, 1)[0];
        let message = req.message
        let isValid = bitcoinMessage.verify(req.message, req.walletAddress, signature);

        if (!isValid) {
            return 'Invalid request'
        }

        try {
            let validRequest = {
                "registerStar": true,
                "status": {
                    "address": req.walletAddress,
                    "requestTimeStamp": req.requestTimeStamp,
                    "message": req.message,
                    "validationWindow": this.calculateTimeLeft(req.requestTimeStamp),
                    "messageSignature": true
                }
            }
            this.validatedRequests.push(validRequest);
            this.validatedRequestsTimeouts.push(setTimeout(() => {
                this.removeValidatedRequest(req.message)
            }, this.timeoutRequestsWindowTime));
            return validRequest;
        } catch (error) {
            return error;
        }
    }

    verifyAddressRequest(address) {
        let validReq = this.validatedRequests.find(req => {
            return req.status.address === address;
        });
        if (validReq === undefined) { return false; }
        return true;
    }
    
    removeValidatedRequest(walletAddress) {
        let addressIndex = this.validatedRequests.findIndex(req => {
            return req.status.address = walletAddress;
        });
        this.validatedRequests.splice(addressIndex, 1);
        this.validatedRequestsTimeouts.splice(addressIndex, 1);
    }
}

module.exports.Mempool = Mempool;
# Udacity Private Blockchain Notary Service Project
This project creates a blockchain, allows you to add stars to it and get them by height, hash or address.

## Getting Started
### Prerequisites
* Node.js

### Installing
All you need to do is type `npm install` in your console.

## Built with
[Node.js](https://nodejs.org/en/) - Node.js is an open-source, cross-platform JavaScript run-time environment that executes JavaScript code server-side. 
[Express.js](https://expressjs.com/) - Express.js library that provides REST functionality in a very easy way.

## Deployment
In the console move to project's directory and type `node blockAPI.js`.

## Usage
In order to add a star to the blockchain is needed to follow the next steps in the same order.
### Request a validation
#### URL
> http://localhost:8000/requestValidation
#### Method
POST
#### Data params
The body must contain the address which you want to sign the transaction with.
##### Example:
```
{
    "address":"124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N"
}
```
#### Success response
**Code:** 200 OK
**Content:**
```
{
    "status": 200,
    "message": {
        "walletAddress": "124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N",
        "requestTimeStamp": "1544176236414",
        "message": "124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N:1544176236414:starRegistry",
        "validationWindow": 300000
    }
}
```

### Validate
Take the message given in the response of the previous step and sign it with the account asociated to the address you provided in first place.
#### URL
> http://localhost:8000/message-signature/validate
#### Method
POST
#### Data params
The body must contain the address that has been used and the signature of the message.
##### Example:
```
{
    "address":"124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N",
    "signature":"IN8cqpNijckAyanNPxukxae37/wn+fsYxI2spvdayCZlaIHDoIrSV70dwZQMG+tr7deP7IwL40yxfg0Xcerk3yU="
}
```
#### Success response
**Code:** 200 OK
**Content:**
```
{
    "status": 200,
    "message": {
        "registerStar": true,
        "status": {
            "address": "124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N",
            "requestTimeStamp": "1544176236414",
            "message": "124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N:1544176236414:starRegistry",
            "validationWindow": 254672,
            "messageSignature": true
        }
    }
}
```

### Post star endpoint
Once the request has been validated the info of the star must be sent.
#### URL
> http://localhost:8000/block
#### Method
POST
#### Data params
The body must have the data of the star as shown in the example.
##### Example:
```
{
	"address": "124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N",
    "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "Found star using https://www.google.com/sky/"
        }
}
```
#### Success response
**Code:** 200 OK
**Content:**
```
{
    "hash": "faee86eee0f4b16065fe5805c7c1e8ded6080cac6e80fe1653c8458012c821ab",
    "height": 1,
    "body": {
        "address": "124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1544170915615",
    "previousBlockHash": "b1fd22dfb227709bce80ace31a896ab91f148d9b358b3a90501a0504dc84ecd8"
}
```

### Get block by height endpoint
#### URL
> http://localhost:8000/block/:height
#### Method
GET
#### URL params
##### Required
`:height=[integer]`
The height must be equal or greater than 0. Example: height = 1
##### Example URL path:
> http://localhost:8000/block/1, where '1' is the block height.
#### Success response
**Code:** 200 OK
**Content:**
```
{
    "hash": "faee86eee0f4b16065fe5805c7c1e8ded6080cac6e80fe1653c8458012c821ab",
    "height": 1,
    "body": {
        "address": "124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1544170915615",
    "previousBlockHash": "b1fd22dfb227709bce80ace31a896ab91f148d9b358b3a90501a0504dc84ecd8"
}
```
#### Error response
If the height provided in the URL is not in the blockchain the call will return:
**Code:** 404 Not Found
**Content:**
```
{
    "status": 404,
    "message": "Block Not Found"
}
```
If the height provided is not a number the call will return:
**Code:** 400 Not Found
**Content:**
```
{
    "status": 400,
    "message": "Bad Request"
}
```

### Get block by hash endpoint
#### URL
> http://localhost:8000/stars/hash::hash
##### Method
GET
##### URL params
###### Required
`:hash=[string]`
Example: hash = faee86eee0f4b16065fe5805c7c1e8ded6080cac6e80fe1653c8458012c821ab
##### Example URL path:
> http://localhost:8000/stars/hash:faee86eee0f4b16065fe5805c7c1e8ded6080cac6e80fe1653c8458012c821ab, where 'faee86eee0f4b16065fe5805c7c1e8ded6080cac6e80fe1653c8458012c821ab' is the block hash.
#### Success response
**Code:** 200 OK
**Content:**
```
{
    "hash": "faee86eee0f4b16065fe5805c7c1e8ded6080cac6e80fe1653c8458012c821ab",
    "height": 1,
    "body": {
        "address": "124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1544170915615",
    "previousBlockHash": "b1fd22dfb227709bce80ace31a896ab91f148d9b358b3a90501a0504dc84ecd8"
}
```
#### Error response
If the hash provided in the URL is not in the blockchain the call will return:
**Code:** 404 Not Found
**Content:**
```
{
    "status": 404,
    "message": "Block Not Found"
}
```

### Get block by address endpoint
#### URL
> http://localhost:8000/stars/address::address
##### Method
GET
##### URL params
###### Required
`:address=[string]`
Example: address = 124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N
##### Example URL path:
> http://localhost:8000/stars/address:124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N, where '124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N' is the address who made the transaction.
#### Success response
It returns an array of all the transactions made by the given account if any.
**Code:** 200 OK
**Content:**
```
[
    {
        "hash": "faee86eee0f4b16065fe5805c7c1e8ded6080cac6e80fe1653c8458012c821ab",
        "height": 1,
        "body": {
            "address": "124zuqjNvWQT9WJwTyCSr9fR5xVbQipp2N",
            "star": {
                "ra": "16h 29m 1.0s",
                "dec": "68° 52' 56.9",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1544170915615",
        "previousBlockHash": "b1fd22dfb227709bce80ace31a896ab91f148d9b358b3a90501a0504dc84ecd8"
    }
]
```
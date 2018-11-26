# Udacity Blockchain Developer Project
This project creates a blockchain and allows you to get existing blocks and add new ones.

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
### GET Block Endpoint
#### URL
> http://localhost:8000/block/:index
##### Method
GET
##### URL params
###### Required
`index=[integer]`
The index must be equal or greater than 0. Example: index = 5
##### Example URL path:
> http://localhost:8000/block/5, where '5' is the block height.
#### Success response
**Code:** 200 OK
**Content:**
```
{
    "hash": "bc1bb760c3feeb455d01e40309c34675d48380e859967abc0fe1201605c2a959",
    "height": 5,
    "body": "Block #5",
    "time": "1543248985555",
    "previousBlockHash": "0baa648acf05b1ce7e423a68e989261bcf8a79eba731f70141f95323073e3aac"
}
```
#### Error response
If the index provided in the URL is not in the blockchain the call will return:
**Code:** 404 Not Found
**Content:**
```
{
    "status": 404,
    "message": "Block Not Found"
}
```
If the index provided is not a number the call will return:
**Code:** 400 Not Found
**Content:**
```
{
    "status": 400,
    "message": "Bad Request"
}
```
### POST Block Endpoint
#### URL
> http://localhost:8000/block
##### Method
POST
##### Data params
The body must not be empty for the block to be valid.
##### Example:
```
{
      "body": "Testing block with test string data"
}
```
#### Success response
**Code:** 200 OK
**Content:**
```
{
    "hash": "ff55ee3e780a35b045f9f432a604a560642a6dcdcdecfd7a4cb460d02ca82176",
    "height": 10,
    "body": "Testing block with test string data",
    "time": "1543252452271",
    "previousBlockHash": "22afb1dc5683a2c64466a15e662ab458f7f5c6d3436cbf2a06544376d84dd373"
}
```
#### Error response
If the payload is empty the call will return:
**Code:** 400 Bad Request
**Content:**
```
{
    "status": 400,
    "message": "Body can't be empty"
}
```
# Udacity Blockchain Developer Project
This project is made to build the necessary skills for a blockchain developer.

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
> http://localhost:8000/block/[blockheight]
#### Example URL path:
> http://localhost:8000/block/5, where '5' is the block height.

### POST Block Endpoint
#### URL
> http://localhost:8000/block

The body must not be empty for the block to be valid.

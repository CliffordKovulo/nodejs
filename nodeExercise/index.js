// index.js

const EventEmitter = require('events');
const logEvents = require('./LogEvents'); 

const myEmitter = new EventEmitter();

myEmitter.on('log', (message) => logEvents(message));

setTimeout(() => {
    myEmitter.emit('log', 'New log event emitted');
}, 2000);
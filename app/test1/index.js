'use strict';

const amqp = require('amqp'),
      config = require('./config'),
      logger = require('log4js').getLogger("index"),
      payload = {name:"Marcelo", lastName:"Adamatti"} 
;
logger.trace("started");

var connection = amqp.createConnection(config.amqp.options,config.amqp.implOptions);
//['close', 'connect', 'data', 'drain', 'error', 'end', 'secureConnect', 'timeout'];
connection.on('ready', function () {
    console.log('conn ready');
    connection.publish(config.amqp.queue.name, payload);
    
    //connection.queue(config.amqp.queue.name, config.amqp.queue.options, function (queue) {
    //       console.log("Queue start")
    //       connection.publish(queue, payload);           
    //       console.log("Queue End")
    //});
    
    logger.trace('Message sent');
})
.on('error',error => {
    logger.error("error", error)  
})
;


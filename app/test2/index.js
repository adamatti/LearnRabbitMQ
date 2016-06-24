'use strict';

const logger = require("log4js").getLogger("index"),
      amqp = require('amqplib/callback_api'),
      events = require("events"),
      eventEmitter = new events.EventEmitter()      
;

logger.trace("started");

function stopIfError(err, result){
    if (!err){
        result();
    } else {
        logger.error("error: ", err);
    }
}

function startQueueConsumption(queueName, ctx, logMsg){
    ctx.ch.consume(queueName, msg => {
        logger.trace(logMsg, msg.content.toString());
        ctx.ch.ack(msg); //need it to remove the message from the queue
    });
}

eventEmitter.on('app_started', () => {
    amqp.connect('amqp://admin:admin@localhost:5672', function(err, conn) {
        return stopIfError(err, () => {
            logger.trace("connected");
            eventEmitter.emit("mq_connected",{conn: conn});
        });            
    })    
});

eventEmitter.on("mq_connected", ctx => {
    ctx.conn.createChannel(function(err, ch) {
        return stopIfError(err, () =>{            
            ctx["ch"] = ch;
            eventEmitter.emit("mq_channel_created",ctx);
        });
    });
});
eventEmitter.on("mq_channel_created", ctx =>{
    logger.trace("channel created");

    eventEmitter.emit("start_queue_producer",ctx);
    eventEmitter.emit("start_queue_consumer",ctx);

    eventEmitter.emit("start_topic_producer",ctx);
    eventEmitter.emit("start_topic_consumer",ctx);
});

eventEmitter.on("start_topic_producer", ctx => {
    ctx.ch.assertExchange('logs', 'fanout', {durable: false});
    ctx.ch.publish('logs', '', new Buffer('Sent to exchange'));
    logger.trace("sent to exchange");
});

eventEmitter.on("start_topic_consumer", ctx => {
    ctx.ch.assertQueue("queue_log1", {durable: true}, function(err, q){
        return stopIfError(err, () => {
            const consumerKey = ''; 
            ctx.ch.bindQueue(q.queue, 'logs', consumerKey);
            return startQueueConsumption(q.queue,ctx,"Msg received(topic1): ");
        });
    });

    ctx.ch.assertQueue("queue_log2", {durable: true}, function(err, q){
        return stopIfError(err, () => {
            const consumerKey = ''; 
            ctx.ch.bindQueue(q.queue, 'logs', consumerKey);
            return startQueueConsumption(q.queue,ctx,"Msg received(topic2): ");
        });
    });    
});

eventEmitter.on("start_queue_producer", ctx =>{
    const q = "test_queue";
    ctx.ch.assertQueue(q, {durable: true},err => {
        return stopIfError(err, () => {
            ctx.ch.sendToQueue(q, new Buffer('sent to queue'), {persistent: true});
            logger.trace("sent to queue");
        });
    });    
    //eventEmitter.emit("shutdown",ctx);
});

eventEmitter.on("shutdown", ctx => {
    logger.trace("shutting down");
    ctx.conn.close();
    process.exit(0);
})

eventEmitter.on("start_queue_consumer", ctx => {
    const q = "test_queue";
    startQueueConsumption(q,ctx,"Msg received(queue): ");
});

eventEmitter.emit("app_started");

'use strict';
var config = {
	amqp: {
		 options: {
            heartbeat: 60,
            url : "amqp://admin:admin@localhost:5672"
        },
        implOptions: {
            //defaultExchangeName: "testExchange",
            reconnect: true,
            reconnectBackoffStrategy: 'linear',
            reconnectExponentialLimit: 120000,
            reconnectBackoffTime: 1000
        },
        queue: {
            name: 'node-test',
            options: {
                durable: false,
                autoDelete: false
            }
        }

        //ssl: {
        //    enabled: true,
        //    // amqp likes certs as filenames
        //    keyFile: config.certs.client.keyFile,
        //    certFile: config.certs.client.certFile,
        //    caFile: config.certs.agcoca.caFile,
        //    rejectUnauthorised: true
        //},
	},
	//exchange: "testExchange"
}

module.exports = config;
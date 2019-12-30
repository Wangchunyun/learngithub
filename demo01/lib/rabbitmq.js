const amqp = require('amqplib');
let connection = null;
const HOST = "47.112.206.212";
const PORT = "5672";
const USERNAME = "admin";
const PASSWORD = "wcy2019";

module.exports = {
    connection,
    init: () => amqp.connect({
        hostname: HOST,
        port: PORT,
        username: USERNAME,
        password: PASSWORD
    }).then(conn => {
        connection = conn;
        console.log('rabbitmq connect success');
        return connection;    
    })
}

// hostname: HOST,
// port: PORT,
// username: USERNAME,
// password: PASSWORD
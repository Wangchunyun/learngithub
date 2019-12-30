const rabbitmq = require('./rabbitmq.js');

/** 消费一个队列
 * @param { Object } connnection  
 * */
async function consumerDLX(connnection) {    
    const testExchangeDLX = 'testExDLX';    
    const testRoutingKeyDLX = 'testRoutingKeyDLX';    
    const testQueueDLX = 'testQueueDLX';

    const ch = await connnection.createChannel();    
    await ch.assertExchange(testExchangeDLX, 'direct', { durable: true });    
    const queueResult = await ch.assertQueue(testQueueDLX, { exclusive: false });    
    await ch.bindQueue(queueResult.queue, testExchangeDLX, testRoutingKeyDLX);

    await ch.consume(queueResult.queue, msg => {        
        console.log('consumer msg：', msg.content.toString());    
    }, { noAck: false });
}

// 消费消息
const rabbitmqClient = async () => {
    let connection = await rabbitmq.init();
    await consumerDLX(connection);
}

module.exports.rabbitmqClient = rabbitmqClient;
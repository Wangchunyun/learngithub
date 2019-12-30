const rabbitmq = require('./rabbitmq.js');

/** 路由一个队列
 * @param { Object } connnection  
 * */
async function producerDLX(connnection, content) {    
    const testExchange = 'testEx';    
    const testQueue = 'testQu';    
    const testExchangeDLX = 'testExDLX';    
    const testRoutingKeyDLX = 'testRoutingKeyDLX';

    const ch = await connnection.createChannel();    
    await ch.assertExchange(testExchange, 'direct', { durable: true });    
    const queueResult = await ch.assertQueue(testQueue, { 
        exclusive: false, deadLetterExchange: testExchangeDLX, deadLetterRoutingKey: testRoutingKeyDLX 
    });    
    await ch.bindQueue(queueResult.queue, testExchange);
    
    const msg = content || 'null';   
    console.log('producer msg：', msg);    
    await ch.sendToQueue(queueResult.queue, new Buffer(msg), { expiration: '10000' });
    
    ch.close();
    connnection.close();
}

// 生成消息
const rabbitmqServer = async (content) => {
    let connection = await rabbitmq.init();
    await producerDLX(connection, content);
}

module.exports.rabbitmqServer = rabbitmqServer;
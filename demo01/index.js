const rabbirS = require('./lib/rabbitmqServer');
const rabbirC = require('./lib/rabbitmqClient');

(async () => {
    // 生成一个消息
    await rabbirS.rabbitmqServer('收到后傻傻的开会了');

    // 消费掉消息
    setTimeout(async function () {
        await rabbirC.rabbitmqClient()
    }, 1000)
})();
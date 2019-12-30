const rabbirS = require('./lib/rabbitmqServer');
const rabbirC = require('./lib/rabbitmqClient');

(async () => {
    // 生成一个消息
    await rabbirS.rabbitmqServer('dfdsfsf发奥德赛');

    // 消费掉消息
    setTimeout(async function () {
        await rabbirC.rabbitmqClient()
    }, 1000)
})();
const rabbirS = require('../rabbitmq/lib/rabbitmqServer');
const rabbirC = require('../rabbitmq/lib/rabbitmqClient');

(async () => {
    await rabbirS.rabbitmqServer('收到后傻傻的开会了');

    setTimeout(async function () {
        await rabbirC.rabbitmqClient()
    }, 1000)
})();
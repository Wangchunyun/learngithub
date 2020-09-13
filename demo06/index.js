const http = require("http");
const common = require('./lib/common');

// session的值
let sessions = {};
let key = 'session_id';
let EXPIRES = 20 * 60 * 1000;

const handle = function (req, res) {
    // if (!req.cookies.isVisit) {
    // if (!req.session.isVisit) {
    //     // res.setHeader('Set-Cookie', [common.setCookie('isVisit', '1'), common.setCookie('111', '222')])
    //     req.session.isVisit = true;
    //     res.writeHead(200)
    //     res.end('欢迎第一次访问网站');
    // } else {
    //     res.writeHead(200)
    //     res.end('欢迎再次访问网站');
    // }

    // 缓存数据方式
    // common.casheFunc(req, res);

    //basic 认证
    common.basicFunc(req, res);
}

http.createServer(function (req, res) {
    // cookie设置
    req.cookies = common.parseCookie(req.headers.cookie);
    // handle(req, res);

    // session设置
    let id = req.cookies[key];
    if (!id) {
        req.session = common.genSession(sessions, EXPIRES);
    } else {
        let flag = common.unsign(id);
        if (!flag) {
            res.writeHead(404);
            res.end('违规操作');
            return;
        }
        let session = sessions[id];
        if (req.body && session._csrf !== req.body._csrf) {
            res.writeHead(403);
            res.end('禁止访问');
            return;
        }
        if (session) {
            if (session.cookie.expire > (new Date()).getTime()) {
                session.cookie.expire = (new Date()).getTime() + EXPIRES;
                req.session = session;
            } else {
                delete sessions[id];
                req.session = common.genSession(sessions, EXPIRES);
            }
        } else {
            req.session = common.genSession(sessions, EXPIRES);
        }
    }
    let writeHead = res.writeHead;
    res.writeHead = function () {
        let cookies = res.getHeader('Set-Cookie');
        let session = common.setCookie(key, req.session.id.toString());
        cookies = !Array.isArray(cookies) ? cookies == undefined ? [session] : [cookies, session] : cookies.concat(session);
        res.setHeader('Set-Cookie', cookies);
        return writeHead.apply(this, arguments);
    }
    handle(req, res);
}).listen(1337);

// 进程异常错误
process.on('error', function (err) {
    console.log(err);
})

console.log('Server running at http://127.0.0.1:1337/')
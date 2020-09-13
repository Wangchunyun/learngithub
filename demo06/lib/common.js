const crypto = require('crypto');
const xml2js = require('xml2js');
const formidable = require('formidable');
const url = require("url");
const fs = require("fs");
const path = require("path");
const querystring = require('querystring');
const { xml } = require('cheerio');
const ROOT = 'E:/myProjects/learngithub/demo06';

module.exports = {
    // 解析cookie
    parseCookie: function (cookie) {
        let cookies = {}
        if (!cookie) {
            return cookies;
        }
        let list = cookie.split(';');
        for (let i = 0; i < list.length; i++) {
            let pair = list[i].split('=');
            cookies[pair[0].trim()] = pair[1];
        }
        return cookies;
    },
    // 设置cookie
    setCookie: function (name, val, opt) {
        let pairs = [name + '=' + val];
        opt = opt || {}

        if (opt.maxAge) pairs.push('Max-Age=' + opt.maxAge)
        if (opt.domain) pairs.push('Domain=' + opt.domain)
        if (opt.path) pairs.push('Path=' + opt.path)
        if (opt.expires) pairs.push('Expires=' + opt.expires.toUTCString())
        if (opt.httponly) pairs.push('Httponly')
        if (opt.secure) pairs.push('Secure')

        return pairs.join(';');
    },
    // 签名
    sign: function (val, secret = 'www1991') {
        return val + '.' + crypto.createHmac('sha256', secret).update(val).digest('base64').replace(/\=+$/, '');
    },
    // 生成随机数
    genRandom: function (len) {
        return crypto.randomBytes(Math.ceil(len * 3 / 4)).toString('base64').slice(0, len);
    },
    // 生成session
    genSession: function (sessions, EXPIRES) {
        let session = {};
        session.id = this.sign((new Date()).getTime().toString());
        session._csrf = this.genRandom(16);
        session.cookie = {
            expire: EXPIRES + (new Date()).getTime()
        };
        sessions[session.id] = session;
        return session;
    },
    // 对比签名验证
    unsign: function (val, secret = 'www1991') {
        let str = val.slice(0, val.lastIndexOf('.'))
        return this.sign(str, secret) == val ? str : false;
    },
    // hash
    genHash: function (str) {
        return crypto.createHash('sha1').update(str).digest('base64');
    },
    // 缓存函数
    casheFunc: function (req, res) {
        let fileName = ROOT + '/test.txt';
        // If-Modified-Since/Last-Modified
        fs.stat(fileName, function (err, stat) {
            let lastModified = stat.mtime.toUTCString();
            if (lastModified === req.headers['if-modified-since']) {
                res.writeHead(304, "NOt Modified");
                res.end();
            } else {
                fs.readFile(fileName, function (err, file) {
                    let lastModified = stat.mtime.toUTCString();
                    res.setHeader('Last-Modified', lastModified);
                    res.writeHead(200, "OK");
                    res.end(file);
                });
            }
        });

        // If-None-Match/ETag
        // fs.readFile(fileName, function (err, file) {
        //     let hash = this.genHash(file);
        //     if (hash === req.headers['if-none-match']) {
        //         res.writeHead(304, "NOt Modified");
        //         res.end();
        //     } else {
        //         res.setHeader('ETag', hash);
        //         res.writeHead(200, "OK");
        //         res.end(file);
        //     }
        // });

        // Cashe-Control更丰富的形式
        // Expires-可能客户端与服务器时间不一致，出现缓存不更新、不删除情况
        // fs.readFile(fileName, function (err, file) {
        //     let expires = new Date();
        //     expires.setTime(expires.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);
        //     res.setHeader('Expires', expires.toUTCString());
        //     res.writeHead(200, "OK");
        //     res.end(file);
        // });
        // fs.readFile(fileName, function (err, file) {
        //     let expires = new Date();
        //     expires.setTime(expires.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);
        //     res.setHeader('Cashe-Control', 'max-age=' + 10 * 365 * 24 * 60 * 60 * 1000);
        //     res.writeHead(200, "OK");
        //     res.end(file);
        // });
    },
    // basic 编码
    basicEncode: function (username, password, type) {
        return type + ' ' + Buffer.from(username + ':' + password).toString('base64');
    },
    // 检测登录用户
    checkUser: function (user, pass) {
        if (user || pass) return true;
    },
    // basic 认证函数
    basicFunc: function (req, res) {
        let auth = req.headers['authorization'];
        console.log(auth);
        if (auth != undefined) {
            let parts = auth.split(' ');
            let mothed = parts[0];
            let encode = parts[1];
            let decode = Buffer.from(encode, 'base64').toString('utf-8').split(':');
            let user = decode[0];
            let password = decode[1];
            console.log(user, password);
            if (!this.checkUser(user, password)) {
                res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
                res.writeHead(401);
                res.end();
            } else {
                res.writeHead(200);
                res.end('登录成功');
            }
        } else {
            res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
            res.writeHead(401);
            res.end(this.basicEncode('wcy', '123', 'basic'));
        }
    },
    // 数据上传处理函数
    formFunc: function (req, res, handle) {
        let hasBody = function (req) {
            return 'transfer-encoding' in req.headers || 'content-type' in req.headers;
        }

        let mime = function (req) {
            let str = req.headers['content-type'] || '';
            return str.split(';')[0];
        }

        if (hasBody(req)) {
            // 内容是否超出长度限制
            let received = 0;
            let bytes = 1024;
            let len = req.headers['Content-Length'] ? parseInt(req.headers['Content-Length'], 10) : null;
            if (len && len > bytes) {
                res.writeHead(413);
                res.end();
                return;
            }

            let buffers = [];
            req.on('data', function (chunk) {
                buffers.push(chunk);
                // limit
                received += chunk.length;
                if (received > bytes) {
                    req.destroy();
                }
            });
            req.on('end', function () {
                req.rawBody = Buffer.concat(buffers).toString();

                if (mime(req) === 'application/json') {
                    try {
                        req.body = JSON.parse(req.rawBody);
                        handle(req, res);
                    } catch (error) {
                        res.writeHead(400);
                        res.end('Invalid JSON');
                        return;
                    }
                } else if (mime(req) === 'application/xml') {
                    xml2js.parseString(req.rawBody, function (err, xml) {
                        if (err) {
                            res.writeHead(400);
                            res.end('Invalid XML');
                            return;
                        }
                        req.body = xml;
                        handle(req, res);
                    });
                } else if (mime(req) === 'application/x-www-form-urlencoded') {
                    req.body = querystring.parse(req.rawBody);
                    handle(req, res);
                } else if (mime(req) === 'multipart/form-data') {
                    let form = new formidable.IncomingForm();
                    form.parse(req, function (err, fields, files) {
                        if (err) {
                            res.writeHead(400);
                            res.end('Invalid Multipa/form-data');
                            return;
                        }
                        req.body = fields;
                        req.files = files;
                        handle(req, res);
                    });
                }
            });
        } else {
            handle(req, res);
        }
    }
}
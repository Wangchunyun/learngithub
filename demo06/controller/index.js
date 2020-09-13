const url = require('url');

/**
 * Controller prototype.
 */

let controller = Controller.prototype;

/**
 * Expose `Controller`.
 */

exports = module.exports = Controller;

/**
 * Initialize a new `Controller`.
 *
 * @api public
 */

function Controller() {
    if (!(this instanceof Controller)) return new Controller;
    this.routes = { 'all': [] }
}

/**
 * 错误处理
 * @param {*} req 
 * @param {*} res 
 */
const handle500 = function (err, req, res, stack) {
    stack = stack.filter(function (middleware) {
        return middleware.length === 4;
    });

    let next = function () {
        let middleware = stack.shift();
        if (middleware) {
            middleware(err, req, res, next);
        }
    }
    next();
}

/**
 * 中间件
 * @param {*} req 
 * @param {*} res 
 * @param {*} stacks 
 */
const handle = function (req, res, stack) {
    let next = function (err) {
        if (err) {
            return handle500(err, req, res, stack);
        }
        let middleware = stack.shift();
        if (middleware) {
            try {
                middleware(req, res, next);
            } catch (error) {
                next(error);
            }
        }
    }
    next();
}

/**
 * 正则匹配路由
 */
const pathRegexp = function (path) {
    let keys = [];

    path = path
        .concat(strict ? '' : '/?')
        .replace(/\/\(/g, '(?:/')
        .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function (_, slash, format, key, capture, optional, star) {
            slash = slash || '';
            // 匹配值存储
            keys.push(key);
            return ''
                + (optional ? '' : slash)
                + '(?:'
                + (optional ? slash : '')
                + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)'))
                + ')'
                + (star ? '(/*)?' : '')
        })
        .replace(/([\/.])/g, '\\$1')
        .replace(/\*/g, '(.*)');

    return {
        keys,
        regexp: new RegExp('^' + path + '$')
    };
}

/**
 * 路径匹配
 * @param {*} pathname 
 * @param {*} routes 
 */
const match = function (pathname, routes) {
    let stacks = [];

    for (let i = 0; i < routes.length; i++) {
        let route = routes[i];
        // 正则匹配
        let reg = route.path[0].regexp;
        // let keys = route.path[0].keys;
        let matched = reg.exec(pathname);
        if (matched) {
            // 抽取值
            // let params = {};
            // for (let i = 0, j = keys.length; i < j; i++) {
            //     let value = matched[i + 1];
            //     if (value) {
            //         params[keys[i]] = value;
            //     }
            // }
            // req.params = params;

            // route[1](req, res);
            stacks = stacks.concat(route.stack);
        }
    }
    return stacks;
}

/**
 * 注册路由
 */
controller.use = function (path, action) {
    // this.routes.all.push([pathRegexp(path), action]);

    let handle;
    if (typeof path === 'string') {
        handle = {
            path: pathRegexp(path),
            stack: Array.prototype.slice.call(arguments, 1)
        };
    } else {
        handle = {
            path: pathRegexp('/'),
            stack: Array.prototype.slice.call(arguments, 0)
        };
    }
    this.routes.all.push(handle);

    ['get', 'post', 'delete', 'put'].forEach(method => {
        this.routes[method] = [];
        controller[method] = function (path, action) {
            this.routes[method].push(handle);
        }
    });
    return this;
}

/**
 * 匹配路由（手动映射）
 */
controller.route = function (req, res) {
    let pathname = url.parse(req.url).pathname;
    // 获取请求方法
    let method = req.method.toLowerCase();
    // 获取all()方法里的中间件
    let stacks = match(pathname, this.routes.all);
    if (this.routes.hasOwnPerperty(method)) {
        stacks.concat(match(pathnamem, this.route[method]));
    }
    if (stacks.length) {
        handle(req, res, stacks);
    } else {
        handle500(err, req, rs, stack);
    }

    // if (this.routes.hasOwnPerperty(method)) {
    //     if (match(pathname, this.routes[method], req, res)) {
    //         return;
    //     } else {
    //         // 匹配没有成功，直接用all处理
    //         if (match(pathname, this.routes['all'], req, res)) {
    //             return;
    //         }
    //     }
    // } else {
    //     // 直接用all处理
    //     if (match(pathname, this.routes['all'], req, res)) {
    //         return;
    //     }
    // }
}

/**
 * 匹配路由(自动映射)
 */
controller.autoRoute = function (req, res) {
    let pathname = url.parse(req.url).pathname;
    let paths = pathname.split('/');
    let controller = paths[1] || 'index';
    let action = paths[2] || 'index';
    let args = paths.slice(3);
    let module;
    try {
        module = require('./controllers/' + controller);
    } catch (error) {
        handle500(req, res);
        return;
    }
    let method = module[action];
    if (method) {
        method.apply(null, [req, res].concat(args));
    } else {
        handle500(req, res);
    }

    handle500(req, res);
}
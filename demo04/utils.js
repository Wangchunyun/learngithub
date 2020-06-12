const rep = require('request-promise')
const fs = require('fs')
const cheerio = require('cheerio')
let downloadDir = 'C:/wcy/mypro/file/img/'


module.exports = {
    // 获取每页数据
    getPage: async (url) => {
        return {
            url,
            res: await rep({ url: url })
        } 
    },
    // 获取连接数据
    getUrl: (data) => {
        const list = []
        // 将html转化为可操作的DOM
        const $ = cheerio.load(data.res)
        $('div#imgid ul li a')
        .each((i, e) => {
            console.log(i,e)
            let obj = {
                name: 'e.attribs.alt',
                url:'e.parent.attribs.href' 
            }
            list.push(obj)
        })
        return list
    },
    // 获取标题
    getTitle: (obj) => {
        downloadDir = downloadDir + obj.name
        if(!fs.existsSync(downloadDir)){
            fs.mkdirSync(downloadDir)
            console.log('创建文件夹成功')
            return true
        } else {
            console.log('文件夹已经存在')
            return false
        }
    },
    // 获取图片数目
    getImagesNum: (res, name) => {
        if(res) {
            let $ = cheerio.load(res)
            let len = $('.pagenavi')
            .find('a')
            .find('span').length

            if(len === 0) {
                fs.rmdirSync(`${ downloadDir}${name}`)
                return 0
            } 
            
            let pageIndex = $('.pagenavi')
            .find('a')
            .find('span')[len - 2].children[0].data

            return pageIndex
        }
    },
    // 下载图片
    downloadImg: async (data, index) => {
        if (data.res) {
            let $ = cheerio.load(data.res)
            if($('.main-image').find('img')[0]) {
                let imageSrc = $('.main-image').find('img')[0].attribs.src
                // 防防盗链
                let headers = {
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                    "Accept-Encoding": "gzip, deflate",
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "Cache-Control": "no-cache",
                    "Host": "i.meizitu.net",
                    "Pragma": "no-cache",
                    "Proxy-Connection": "keep-alive",
                    "Referer": data.url,
                    "Upgrade-Insecure-Requests": 1,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.19 Safari/537.36"
                }
                await rep({
                    imageSrc,
                    resolveWithFullResponse: true,
                    headers
                }).pipe(fs.createWriteStream(`${downloadDir}/${index}.jpg`))
                console.log(`${downloadDir}/${index}.jpg下载成功`)
            }
        } else {
            console.log(`${downloadDir}/${index}.jpg加载失败`)
        }
    },
    downloadImg: async (list, index) => {
        console.log(list, index)
        if(index === list.length) {
            start++;
            if(start < end) {
                main(basicPath + start)
            }
            return false
        } 
        
        if (utils.getTitle(list[index])) {
            let item = await utils.getPage(list[index].url)
            let imageNum = utils.getImagesNum(item.res, list[index].name)
    
            for(let i = 0; i < imageNum; i++) {
                let page = utils.getPage(list[index].url + `/${i}`)
                await utils.downloadImg(page, i)
            }
    
            index++;
            downloadImg(list, index)
        } else {
            index++;
            downloadImg(list, index)
        }
    }, 
    getNews: async (res, type) => {
        let news = [];
        // 访问成功，请求http://news.baidu.com/页面所返回的数据会包含在res.text中。
        
        /* 使用cheerio模块的cherrio.load()方法，将HTMLdocument作为参数传入函数
            以后就可以使用类似jQuery的$(selectior)的方式来获取页面元素
        */

        // console.log(res.text)
        // 存入文件
        // fs.writeFileSync('c:/wcy/1.text',res.text)

        let $ = cheerio.load(res.text);

        // 找到目标数据所在的页面元素，获取数据
        if(type === 'hot') {
            $('div#pane-news ul li a').each((idx, ele) => {
                // cherrio中$('selector').each()用来遍历所有匹配到的DOM元素
                // 参数idx是当前遍历的元素的索引，ele就是当前便利的DOM元素
                let obj = {
                    title: $(ele).text(),        // 获取新闻标题
                    href: $(ele).attr('href')    // 获取新闻网页链接
                };
                news.push(obj)              // 存入最终结果数组
            });
        }
        if(type === 'local') {
            $('ul#localnews-focus li a').each((index, ele) => {
                let obj = {
                    title: $(ele).text(),        // 获取新闻标题        
                    href: $(ele).attr('href')    // 获取新闻网页链接
                };
                news.push(obj)              // 存入最终结果数组
            })

            if(!news.length) {
                let url = 'https://news.baidu.com/widget?id=LocalNews&loc=5496&ajax=json&t=1591066980888'
                res = await rep({ url })
                let json = JSON.parse(res)
                news =json.data.LocalNews.data.rows
            }
        }
        if(type === 'world') {
            $('div#guojie ul li a').each((index, ele) => {
                let obj = {
                    title: $(ele).text(),        // 获取新闻标题        
                    href: $(ele).attr('href')    // 获取新闻网页链接
                };
                news.push(obj)              // 存入最终结果数组
            })
            

            if(!news.length) {
                let url = 'https://news.baidu.com/widget?id=InternationalNews&t=1591077273983'
                res = await rep({ url })

                let $ = cheerio.load(res);
                $('div#guojie ul li a').each((index, ele) => {
                    let obj = {
                        title: $(ele).text(),        // 获取新闻标题        
                        href: $(ele).attr('href')    // 获取新闻网页链接
                    };
                    news.push(obj)              // 存入最终结果数组
                })
            }
        }
        return news
    }
}
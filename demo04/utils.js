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
        $('#pins li a')
        .children()
        .each(async (i, e) => {
            let obj = {
                name: e.attribs.alt,
                url: e.parent.attribs.href
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
                let imageSrc = $('.main-image').find('img')[0].attribs.alt
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
    }
}
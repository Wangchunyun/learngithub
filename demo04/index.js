const utils = require('./utils')
const basicPath = 'https://image.baidu.com/search/index?ct=201326592&cl=2&st=-1&lm=-1&nc=1&ie=utf-8&tn=baiduimage&ipn=r&rps=1&pv=&fm=rs6&word=%E9%A3%8E%E6%99%AF%E5%A3%81%E7%BA%B8&oriquery=%E5%9B%BE%E7%89%87&ofr=%E5%9B%BE%E7%89%87&hs=2&sensitive=0'

let start = 1, end = 3
const main = async url => {
    let list = [], index = 0
    const data = await utils.getPage(url)
    // console.log(data)
    list = utils.getUrl(data)
    console.log(list)
    // await downloadImg(list, index)
}

const downloadImg = async (list, index) => {
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
}

main(basicPath)
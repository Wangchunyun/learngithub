const utils = require('./utils')
const basicPath = 'http://www.baidu.com'

let start = 1, end = 3
const main = async url => {
    let list = [], index = 0
    const data = await utils.getPage(url)
    list = utils.getUrl(data)
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
const fs = require('fs');


module.exports.conver = (dir) => {
    const fileContent = fs.readFileSync(dir, 'hex');
    return fileContent;
}
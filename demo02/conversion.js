const fs = require('fs');
const _l = require('loadsh');

module.exports.conver = (dir) => {
    const fileContent = fs.readFileSync(dir, 'hex');

    let arr1 = [
        3113829,3114247,3114269,3114273,3118598,3118727,3118729
    ];
    let arr2 = [
        3113829,3114247,3114269,3114273,3114285,3118727,3118729
    ];

    
    console.log(_l.difference(arr1, arr2));
    
    return fileContent;
}
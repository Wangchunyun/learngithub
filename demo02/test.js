'use strict';
console.log(a);
var a = 'default value';

a = function() {
    let a = 'default value 2';
    console.log(a);
}
console.log(a());

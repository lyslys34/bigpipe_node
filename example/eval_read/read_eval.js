/*
 * A example to fetch stirng and convert to function using eval() 
 */

var fs = require('fs');


var helperReg = /helper=.+;}/;
var str = "{{#result}}{{res}}{{/}}";

var fileStr = fs.readFileSync('test.inc', 'utf-8');
var helper = fileStr.match(helperReg);

var fn = null;

console.info("helper:", helper[0]);

if (fileStr) {
    try {
        fn = eval(helper[0]);
    } catch (e) {
        console.info(e);
    }
}


if (typeof fn === 'function') {
    console.info(fn(str));
} else {
    console.info('fn is not a function');
}
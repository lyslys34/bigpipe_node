var render;

var metaRegExp = /<%=([\s\S]+?)%>/g; // match <%=username%> which is escape
var metaORegExp = /<%-([\s\S]+?)%>/g; // match <%-username%> which is not escape

render = function (str, data) {
    var tpl = str.replace(metaRegExp, function (match, code) {
        return "' + escape(" +  code + ") + '";
    }).replace(metaORegExp, function (match, code) {
        return "' + " + code + " + '";
    });
    
    tpl = "tpl = '" + tpl + "'";
    tpl = ''
};

module.exports = render;
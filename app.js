var express = require('express'),
    path = require('path'),
    jade = require('jade'),
    fs = require('fs'),
    debug = require('debug')('h5');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var getData = {
    d1: function (fn) {
        setTimeout(fn, 8000, null, {content: 'first section'});
    },
    d2: function (fn) {
        setTimeout(fn, 5000, null, {content: 'second section'});
    }
};

// Because Bigpipe, it need to create related route rule to 
// deceide which part use bigpipe and which not
app.use('/static',express.static(path.join(__dirname, 'static')));

app.get('/', function (req, res) {
    // register bigpipe module
    res.pipeLayout('layout1', {
        s1: res.pipeName('s1name'),
        s2: res.pipeName('s2name')
    })
    getData.d1(function (err, s1data) {
      res.pipePartial('s1name', 's1', s1data);
    });
    getData.d2(function (err, s2data) {
      res.pipePartial('s2name', 's2', s2data);
    });
});

// Record pipe name in response object
function PipeName (res, name) {
    res.pipeCount = res.pipeCount || 0;
    res.pipeMap = res.pipeMap || {};
    if (res.pipeMap[name]) {return;}
    res.pipeCount++;
    res.pipeMap[name] = this.id = 
      ['pipe', Math.random().toString().substring(2), (new Date()).valueOf()].join('_');
    this.res = res;
    this.name = name;
};

var resProto = require('express/lib/response');

//Use JQuery replaceWith to output the pipe content in response
resProto.pipe = function (selector, html, replace) {
    this.write('<script>' + '$("' + selector + '").' + 
      (replace === true ? 'replaceWith' : 'html') + 
      '("' + html.replace(/"/g, '\\"').replace(/<\/script>/g, '<\\/script>') +
      '")</script>');
};

// Register pipe in response
resProto.pipeName = function (name) {
  return new PipeName(this, name);
};

resProto.pipeLayout = function (view, options) {
  var res = this;
  Object.keys(options).forEach(function (key) {
    if (options[key] instanceof PipeName) {
      options[key] = '<span id="' + options[key].id + '"></span>';
    }  
  });
  // 'str' param is created by res.render() method,
  // when use template(jade, )
  res.render(view, options, function (err, str) {
    if (err) return res.req.next(err);
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.write(str);
    if (!res.pipeCount) res.end();
  });
};

resProto.pipePartial = function (name, view, options) {
  var res = this;
  res.render(view, options, function (err, str) {
      if (err) res.req.next(err);
      res.pipe('#' + res.pipeMap[name], str, true);
      --res.pipeCount || res.end();
  })
}

var server = app.listen(4000);
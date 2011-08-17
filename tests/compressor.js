// vim: set sw=2 ts=2:

var fs = require('fs');
var path = require('path');
var http = require('http');
var querystring = require('querystring');
var util = require('util');

function run(content, type, output) {
  var postData = querystring.stringify({
    content: content,
    config: JSON.stringify({
      type: type,
      steps: [['compressor', {}]]
    })
  });

  var opts = {
    host: 'trade.ued.taobao.net',
    port: 8080,
    path: '/precompile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  var postReq = http.request(opts, function(res) {
    res.setEncoding('utf8');
    var code = '';
    res.on('data', function(chunk) {
      code += chunk.toString();
    }).on('end', function(chunk) {
      console.log(output || 'Done.');
    });
  });

  postReq.write(postData);
  postReq.end();
}


function read(name) {
  var content = path.join(__dirname, 'data', name);
  return fs.readFileSync(content).toString();
}

//run(read('kissy.js'), 'JavaScript');
//run(read('kissy-min.js'), 'JavaScript');
//run(read('search.css'), 'CSS');
//run(read('search.source.css'), 'CSS', i);
// encode problem
var content = read('kissy.js');
for (var i = 0, l = 100; i < l; i++) {
  run(content, 'JavaScript', i);
}

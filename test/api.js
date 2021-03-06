// vim: set sw=2 ts=2:

var assert = require('assert');
var APIeasy = require('api-easy');
var fs = require('fs');
var path = require('path');

var suite = APIeasy.describe('API Test');

suite.use('localhost', 8088)
  .setHeader('Content-Type', 'application/json; charset=GBK');

suite.next().post('/precompile', {
    content: '#id{color: #ffffff}',
    config: JSON.stringify({
      type: 'CSS',
      steps: [
        ['compressor', {}]
      ]
    })
  })
  .expect(200)
  .expect('should compress css', function(err, res, body) {
    body = JSON.parse(body);
    assert.ok(body.success);
    assert.equal('#id{color:#fff}', body.result);
  });

suite.next().post('/precompile', {
    content: '#id{width: 10px + 20px}',
    config: JSON.stringify({
      type: 'CSS',
      steps: [
        ['less', {}],
        ['compressor', {}]
      ]
    })
  })
  .expect(200)
  .expect('should compile less and compress css', function(err, res, body) {
    body = JSON.parse(body);
    assert.ok(body.success);
    assert.equal('#id{width:30px}', body.result);
  });

suite.next().post('/precompile', {
    content: '(function(kissy) {})(KISSY)',
    config: JSON.stringify({
      type: 'JavaScript',
      steps: [
        ['compressor', {}]
      ]
    })
  })
  .expect(200)
  .expect('should compress javascript', function(err, res, body) {
    body = JSON.parse(body);
    assert.ok(body.success);
    assert.equal('(function(a){})(KISSY);', body.result);
  });

suite.next().post('/precompile', {
    content: '@name = "frank"',
    config: JSON.stringify({
      type: 'JavaScript',
      steps: [
        ['coffeescript', {}],
        ['compressor', {}]
      ]
    })
  })
  .expect(200)
  .expect('should compile coffeescript and compress javascript',
    function(err, res, body) {
      body = JSON.parse(body);
      assert.ok(body.success);
      eval(body.result);
      assert.equal(this.name, "frank");
    });

suite.next().post('/precompile', {
    content: fs.readFileSync(fs.realpathSync('./test/data/gbk.js')).toString(),
      config: JSON.stringify({
      type: 'JavaScript',
      steps: [
        ['nativeascii', {}],
        ['compressor', {}]
      ]
    })
  })
  .expect(200)
  .expect('should compile with chinese character',
    function(err, res, body) {
      body = JSON.parse(body);
      assert.ok(body.success);
      assert.equal('var str="\\u4e2d\\u6587";', body.result);
    });

suite.export(module);

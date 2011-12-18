// vim: set sw=2 ts=2:

/**
 * @fileoverview publish page.
 * @author yyfrankyy@gmail.com (Frank Xu)
 */

define(function(require, exports) {
  var $ = require('jquery');
  var statuses = [
    '开始启动预处理任务'
  , '预处理完成'
  //, '写入磁盘，推送PUB100'
  //, '推送CDN'
  //, '发布完成'
  ];
  exports.init = function(el) {
    var timer = setInterval(function() {
      require.async(el.data('href') + '&t=' + +new Date, function(results) {
        var len = results.length;
        for (var i in results) {
          var container = $('#' + i);
          var status = results[i];
          if (status.code >= statuses.length - 1) clearTimeout(timer);

          // TODO 这里调整下交互，这么实现恶心了。。
          var bar = $('.bar', container);
          var message = $('.message', container);
          var html = '<ol>';
          statuses.forEach(function(status) {
            html += '<li>' + status + '</li>';
          });
          message.html(html + '</ol>');
          var queue = $('li', el);

          bar.width((status.code + 1) * el.data('max') / statuses.length);
          for (var i = 0, l = status.code + 1; i < l; i++) {
            $(queue[i]).addClass('done');
            $(queue[i]).html(statuses[i] + ' <strong>&#8730;</strong>');
          }
        }
      });
    }, 1000);
  };
});
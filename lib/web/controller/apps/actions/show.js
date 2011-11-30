// vim: set sw=2 ts=2:

/**
 * @fileoverview show.
 * @author yyfrankyy@gmail.com (Frank Xu)
 */

module.exports = function(req, res, apptype, appname, filepath, self, o) {

  res.local('app-detail', true);

  // 拆分路径给面包屑
  var filename = '';
  if (filepath) {
    var ps = filepath.split(/\//g);
    filename = ps.pop();
    res.local('app-filename', filename);

    var pathes = [];
    ps.forEach(function(path, i) {
      pathes[i] = {
        href: ps.slice(0, i + 1).join('/'),
        name: path
      };
    });

    res.local('pathes', pathes);
  }

  // 直接显示文本内容，图片暂时不支持
  if (typeof o !== 'object') {
    var ext = require('path').extname(filename);
    res.local('app-fileextend', ext);
    if (WebUtil.isTxt(ext)) {
      res.local('txt', true);
    } else {
      res.local('preview-unsupported', true);
    }

    res.local('app-file', true);
    WebUtil.partial(res, 'file');
  }

  res.local('svn', o);
  WebUtil.partial(res, 'detail');
  res.render('index');
};
// vim: set sw=2 ts=2:

/**
 * @fileoverview 新建应用.
 * @author yyfrankyy@gmail.com (Frank Xu)
 */

App.get('/apps/new', function(req, res) {
  // create a new instance

  function newapp() {
    res.local('newapp', true);
    res.local('title', '添加应用');
    res.local('apptype-href', 'apps/new');
    res.local('apptype-name', '添加应用');
    var apptypes = [];
    for (var i in WebConfig.apps) {
      apptypes.push({
        value: WebConfig.apptypes[i],
        name: WebConfig.apps[i]
      });
    }
    res.local('apptypes', apptypes);
    WebUtil.render(res, 'newapp');
  }

  if (req.query.apptype &&
      req.query.appname &&
      req.query.svnroot) {

    // 给根目录补全最后一个斜杠
    // 避免读svn的时候有一次301
    if (!/\/$/.test(req.query.svnroot))
      req.query.svnroot += '/';

    svnquery(req.query.svnroot, RmsConfig.svn, function(err, o) {
      if (err) {
        res.local('message', {
          type: 'error',
          text: err.message
        });
        return newapp();
      }

      var App = require('../../model/app');
      var app = new App({
        name: req.query.appname,
        svnroot: req.query.svnroot,
        type: req.query.apptype,
        version: +o.rev
      });
      app.create(function(err) {
        res.local('message', !err ? {
          type: 'success',
          text: '应用添加成功！'
        } : {
          type: 'error',
          text: err.message
        });
        return newapp();
      });
    });
  } else {
    return newapp();
  }
});

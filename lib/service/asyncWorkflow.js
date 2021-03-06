// vim: set sw=2 ts=2:

/**
 * @fileoverview Async Workflow.
 * @author yyfrankyy@gmail.com (Frank Xu)
 */

var util = require('util');
var emitter = process.EventEmitter;
var _ = require('underscore');
var rmsConfig = require('../rmsConfig');
var rmsUtil = require('../rmsUtil');

function asyncWorkflow(content, config) {
  var self = this;
  emitter.call(this);

  self.config = _.extend({
    type: 'string',
    steps: []
  }, config);

  self.content = content || '';
  self.__content = self.content;
  self.type = self.config.type;

  self.steps = [];
  self.current = -1;

  self.config.steps.forEach(function(step) {
    var jobName = step[0];
    var jobConfig = step[1];

    if (jobName in rmsConfig.jobs) {
      var Job = require('./jobs/' + jobName);
      var job = new Job(_.extend({
        type: self.type
      }, rmsConfig.jobs[jobName], jobConfig));
      self.steps.push(job);
    } else {
      throw new asyncWorkflow.JOB_NOT_SUPPORTED(
          'Job is not supported: ' + jobName);
    }
  });
}
util.inherits(asyncWorkflow, emitter);


asyncWorkflow.prototype.start = function() {
  this.current = -1;
  this.emit('start', {
    time: new Date()
  });
  this.next(this.content);
};


asyncWorkflow.prototype.next = function(content, message) {
  var self = this;

  if (!self.steps[self.current + 1]) {
    self.emit('complete', {
      result: self.content,
      success: true,
      message: message,
      time: new Date()
    });
    return;
  }

  self.current += 1;

  self.emit('stepStart', {
    input: content,
    time: new Date()
  });

  try {
    self.steps[self.current].run(self.content, function(nextContent, err) {
      if (!nextContent || err) {
        self.rollback(err || new asyncWorkflow.ASYNC_WORKFLOW_NOT_COMPLETE());
        return;
      }

      self.emit('stepComplete', {
        output: nextContent,
        time: new Date()
      });

      self.content = nextContent;
      self.next(self.content);
    });
  } catch (ex) {
    self.rollback(ex);
  }
};


asyncWorkflow.prototype.rollback = function(exception) {
  this.emit('error', {
    error: exception,
    time: new Date()
  });
  // rollback to original content
  this.content = this.__content;
  this.emit('complete', {
    result: this.content,
    success: false,
    message: exception.message,
    time: new Date()
  });
};


var ASYNC_WORKFLOW_NOT_COMPLETE = rmsUtil.createException(
    'Uncaught exception. Async workflow is not complete');
var JOB_NOT_SUPPORTED = rmsUtil.createException('Job is unsupported.');


asyncWorkflow.__defineGetter__('ASYNC_WORKFLOW_NOT_COMPLETE', function() {
  return ASYNC_WORKFLOW_NOT_COMPLETE;
});


asyncWorkflow.__defineGetter__('JOB_NOT_SUPPORTED', function() {
  return JOB_NOT_SUPPORTED;
});


module.exports = asyncWorkflow;

var spawn = require('child_process').spawn;

var buildError = require('./error').buildError;

var DEFAULT_TIMEOUT_IN_MILLIS = 30000;

module.exports.timedExec = function(command, commandArgs, options, callback) {
  var safeOptions = fillDefaultOptions(options);
  var safeCallback = buildSingleCallCallback(callback);
  var childProcess = spawn(command, commandArgs, safeOptions);
  var timeout = failAfterTimeout(childProcess, safeOptions.timeoutInMillis, safeCallback);
  watchOutput(childProcess, timeout, safeCallback);
  return childProcess;
}

function fillDefaultOptions(options) {
  return Object.keys(options).reduce(function(result, key) {
    result[key] = options[key];
    return result;
  }, { timeoutInMillis: DEFAULT_TIMEOUT_IN_MILLIS, detached: true });
}

function buildSingleCallCallback(callback) {
  var called = false;
  return function() {
    if (!called) {
      called = true;
      callback.apply(null, arguments);
    }
  }
}

function watchOutput(childProcess, timeout, callback) {
  var output = '';
  var error = '';
  childProcess.stdout.on('data', function (data) {
    output += String(data);
  });

  childProcess.stderr.on('data', function (data) {
    error += String(data);
  });

  childProcess.on('exit', function(code) {
    var errorResult = code === 0 ? null : buildError('solver_error', error);
    clearTimeout(timeout);
    callback(errorResult, output);
  })
}

function failAfterTimeout(childProcess, timeoutInMillis, callback) {
  var timeout = setTimeout(handleTimeout(childProcess, callback), timeoutInMillis);
  timeout.unref();
  return timeout;
}

function handleTimeout(childProcess, callback) {
  return function() {
    callback(buildError('timeout_error', 'solver timed out'));
    process.kill(-childProcess.pid);
  };
}

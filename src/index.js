var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

var SOLVER_DIR = path.join(__dirname, '../', './lib');
var SOLUTION_SEPARATOR = '----------';
var SOLVE_COMMAND = './solve --num-solutions 1 --solution-separator ' + SOLUTION_SEPARATOR + ' ';
var DEFAULT_TIMEOUT_IN_MILLIS = 30000;

module.exports.solve = solveMinizincProblem;
module.exports.solveWithTimeout = solveMinizincProblemWithTimeout;

function solveMinizincProblem(minizincProblemString, callback) {
  solveMinizincProblemWithTimeout(minizincProblemString, DEFAULT_TIMEOUT_IN_MILLIS, callback)
}

function solveMinizincProblemWithTimeout(minizincProblemString, timeoutInMillis, callback) {
  var problemFilePath = buildProblemFilePath();
  var solve = runTimedSolver(problemFilePath, timeoutInMillis, callback);
  fs.writeFile(problemFilePath, minizincProblemString, solve);
}

function buildProblemFilePath() {
  var date = new Date();
  var random = Math.round(Math.random() * 1000);
  var fileName = 'problem_' + date.getTime() + '_' + random + '.mzn';
  return path.join(__dirname, '../', fileName);
}

function runTimedSolver(problemFilePath, timeoutInMillis, callback) {
  return function() {
    var process = runSolver(problemFilePath, timeoutInMillis, callback);
    setTimeout(process.kill.bind(process), timeoutInMillis);
  };
}

function runSolver(problemFilePath, timeout, callback) {
  var command = SOLVE_COMMAND + problemFilePath;
  return exec(command, { cwd: SOLVER_DIR }, function(error, result) {
    fs.unlink(problemFilePath);
    if (error) {
      error.killed ? handleTimeout(timeout, callback) : handleMiniZincError(error, callback);
    } else {
      parseResult(result, callback);
    }
  });
}

function handleTimeout(timeoutInMillis, callback) {
  callback(buildError('timeout_error', 'solver timed out in ' + timeoutInMillis + 'ms'));
}

function handleMiniZincError(error, callback) {
  var errorStart = "\nError: ";
  var message = error.message.substring(error.message.indexOf(errorStart) + errorStart.length);
  var lineNumber = error.message.match(/\.mzn:(\d+):/)[1];
  callback(buildError('syntax_error', '(line ' + lineNumber + '): ' + message));
}

function parseResult(resultString, callback) {
  if (resultString.indexOf(SOLUTION_SEPARATOR) < 0)
    callback(null, null);
  else
    callback(null, resultString.split(SOLUTION_SEPARATOR)[0]);
}

function buildError(type, message) {
  return {
    isMiniZincError: true,
    type: type,
    message: 'MiniZinc error: ' + message
  };
}

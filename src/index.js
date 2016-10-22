var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');

var SOLVER_DIR = path.join(__dirname, '../', './lib');
var SOLUTION_SEPARATOR = '----------';
var SOLVE_COMMAND = './solve';
var SOLVE_COMMAND_ARGS = ['--num-solutions', 1, '--solution-separator', SOLUTION_SEPARATOR];
var DEFAULT_TIMEOUT_IN_MILLIS = 30000;

module.exports.solve = solveMinizincProblem;
module.exports.solveWithTimeout = solveMinizincProblemWithTimeout;

function solveMinizincProblem(minizincProblemString, callback) {
  solveMinizincProblemWithTimeout(minizincProblemString, DEFAULT_TIMEOUT_IN_MILLIS, callback)
}

function solveMinizincProblemWithTimeout(minizincProblemString, timeoutInMillis, callback) {
  var problemFilePath = buildProblemFilePath();
  var onFinished = buildOnFinishedHandler(problemFilePath, callback);
  var solverArgs = SOLVE_COMMAND_ARGS.concat([problemFilePath]);
  var solve = runTimedSolver(solverArgs, timeoutInMillis, onFinished);
  fs.writeFile(problemFilePath, minizincProblemString, solve);
}

function buildProblemFilePath() {
  var date = new Date();
  var random = Math.round(Math.random() * 1000);
  var fileName = 'problem_' + date.getTime() + '_' + random + '.mzn';
  return path.join(__dirname, '../', fileName);
}

function buildOnFinishedHandler(problemFilePath, callback) {
  return function() {
    ['.mzn', '.fzn', '.ozn'].forEach(function(ending) {
      fs.unlink(problemFilePath.replace('.mzn', ending));
    });
    callback.apply(null, arguments);
  };
}

function runTimedSolver(solverArgs, timeoutInMillis, callback) {
  return function() {
    var childProcess = runSolver(solverArgs, callback);
    setTimeout(handleTimeout(childProcess, callback), timeoutInMillis);
  };
}

function runSolver(args, callback) {
  return spawn(SOLVE_COMMAND, args, { cwd: SOLVER_DIR, detached: true }, function(error, result) {
    error ? handleMiniZincError(error, callback) : parseResult(result, callback);
  });
}

function handleTimeout(childProcess, callback) {
  return function() {
    process.kill(-childProcess.pid);
    callback(buildError('timeout_error', 'solver timed out'));
  };
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

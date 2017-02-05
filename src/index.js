var fs = require('fs');
var path = require('path');

var timedExec = require('./timed-exec').timedExec;
var buildError = require('./error').buildError;

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
      fs.unlink(problemFilePath.replace('.mzn', ending), function() {
        // ignore failed deletions as these will have been performed by the solver if it succeeds
      });
    });
    callback.apply(null, arguments);
  };
}

function runTimedSolver(solverArgs, timeoutInMillis, callback) {
  var options = { cwd: SOLVER_DIR, timeoutInMillis: timeoutInMillis };
  return function() {
    timedExec(SOLVE_COMMAND, solverArgs, options, function(error, result) {
      error ? handleMiniZincError(error, callback) : parseResult(result, callback);
    });
  };
}

function handleMiniZincError(error, callback) {
  callback(error.type === 'solver_error' ? parseSolverError(error) : error);
}

var ERROR_START = "\nError: ";

function parseSolverError(error) {
  var errorMessage = error.message || '';
  return extractMinizincError(errorMessage) || buildError('unknown_error', error);
}


function extractMinizincError(errorMessage) {
  var message = errorMessage.substring(errorMessage.indexOf(ERROR_START) + ERROR_START.length);
  if (message.length >= 0) {
    var lineNumber = extractLineNumberString(errorMessage);
    return buildError('syntax_error', '(line ' + lineNumber + '): ' + message);
  }
  else {
    return null;
  }
}

function extractLineNumberString(message) {
  var lineNumberMatch = message.match(/\.mzn:(\d+):/);
  if (lineNumberMatch) {
    var lineNumber = lineNumberMatch[1] || 'number unknown';
    return '(line ' + lineNumber + ')';
  }
  else {
    return '';
  }
}

function parseResult(resultString, callback) {
  if (resultString.indexOf(SOLUTION_SEPARATOR) < 0)
    callback(null, null);
  else
    callback(null, resultString.split(SOLUTION_SEPARATOR)[0]);
}

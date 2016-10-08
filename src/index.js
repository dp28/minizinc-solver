var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

var SOLVER_DIR = path.join(__dirname, '../', './lib');
var SOLUTION_SEPARATOR = '----------';
var SOLVE_COMMAND = './solve --num-solutions 1 --solution-separator ' + SOLUTION_SEPARATOR + ' ';

module.exports.solve = function solveMinizincProblem(minizincProblemString, callback) {
  var problemFilePath = buildProblemFilePath();
  fs.writeFile(problemFilePath, minizincProblemString, runSolver(problemFilePath, callback));
}

function buildProblemFilePath() {
  var date = new Date();
  var random = Math.round(Math.random() * 1000);
  var fileName = 'problem_' + date.getTime() + '_' + random + '.mzn';
  return path.join(__dirname, '../', fileName);
}

function runSolver(problemFilePath, callback) {
  return function() {
    exec(SOLVE_COMMAND + problemFilePath, { cwd: SOLVER_DIR }, function(error, result) {
      error ? handleMiniZincError(error, callback) : parseResult(result, callback);
      fs.unlink(problemFilePath);
    });
  }
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

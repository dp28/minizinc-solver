var Promise = require('bluebird');
var exec = Promise.promisify(require('child_process').exec);
var fs = require('fs');
var writeFile = Promise.promisify(fs.writeFile);
var unlink = Promise.promisify(fs.unlink);
var path = require('path');

var SOLVER_DIR = path.join(__dirname, '../', './lib');
var SOLUTION_SEPARATOR = '----------';
var SOLVE_COMMAND = './solve --num-solutions 1 --solution-separator ' + SOLUTION_SEPARATOR + ' ';

module.exports.solve = function(minizincProblemString) {
  return solveMinizincProblem(minizincProblemString);
}

function solveMinizincProblem(minizincProblemString) {
  var problemFilePath = buildProblemFilePath();
  return writeFile(problemFilePath, minizincProblemString)
    .then(runSolver(problemFilePath))
    .then(parseResult)
    .finally(deleteFile(problemFilePath));
}

function buildProblemFilePath() {
  var date = new Date();
  var random = Math.round(Math.random() * 1000);
  var fileName = 'problem_' + date.getTime() + '_' + random + '.mzn';
  return path.join(__dirname, '../', fileName);
}

function runSolver(problemFilePath) {
  return function() {
    return exec(SOLVE_COMMAND + problemFilePath, { cwd: SOLVER_DIR });
  }
}

function parseResult(resultString) {
  return JSON.parse(resultString.split(SOLUTION_SEPARATOR)[0]);
}

function deleteFile(filePath) {
  return function() {
    return unlink(filePath);
  }
}

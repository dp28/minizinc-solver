module.exports.buildError = function(type, message) {
  return {
    isMiniZincError: true,
    type: type,
    message: 'MiniZinc error: ' + message
  };
}

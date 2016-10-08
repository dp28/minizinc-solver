var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

describe('#solve', function() {
  var solve = require('../src').solve;

  function catchMiniZincErrors(promise) {
    return promise.catch(function(error) {
      if (!error.isMiniZincError)
        throw error;
      return error;
    });
  }

  context('with a valid MiniZinc problem definition', function() {
    var problem = 'var 0..1: x; solve satisfy; output ["x -> ", show(x)];'

    it('should return a Promise that completes successfully', function() {
      return expect(solve(problem)).to.eventually.be.fulfilled;
    });

    it('should return the specified output format', function() {
      return expect(solve(problem)).to.eventually.match(/^x -> [0,1]\n$/);
    });
  });

  context('with an invalid MiniZinc problem definition', function() {
    var problem = 'var 0..'

    it('should return a Promise that fails', function() {
      return expect(solve(problem)).to.eventually.be.rejected;
    });

    it('should return a Promise that fails', function() {
      var MiniZincSynatxError = require('../src').MiniZincSynatxError;
      return expect(solve(problem)).to.eventually.be.rejectedWith(/minizinc.*error.+syntax/i);
    });

    it('should include the line number in the error message', function() {
      return expect(solve(problem)).to.eventually.be.rejectedWith(/line.+1/i);
    });

    it('should include the type "syntax_error" in the error object', function() {
      return expect(catchMiniZincErrors(solve(problem)))
        .to.eventually.have.property('type', 'syntax_error');
    });
  });
});

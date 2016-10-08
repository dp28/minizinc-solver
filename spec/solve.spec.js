var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

describe('#solve', function() {
  var solve = require('../src').solve;

  context('with a valid MiniZinc problem definition', function() {
    var problem = 'var 0..1: x; solve satisfy; output ["x -> ", show(x)];'

    it('should return a Promise that completes successfully', function() {
      return expect(solve(problem)).to.eventually.be.fulfilled;
    });

    it('should return the specified output format', function() {
      return expect(solve(problem)).to.eventually.match(/^x -> [0,1]\n$/);
    });
  });
});

var expect = require('chai').expect;

describe('#solve', function() {
  var solve = require('../src').solve;

  context('with a valid MiniZinc problem definition', function() {
    var problem = 'var 0..1: x; solve satisfy; output ["x -> ", show(x)];'

    it('should pass the specified output format to the callback', function(done) {
      solve(problem, function(_, output) {
        expect(output).to.match(/^x -> [0,1]\n$/);
        done();
      });
    });

    it('should return a falsy error value', function(done) {
      solve(problem, function(error) {
        expect(error).to.beFalsy
        done();
      });
    });

    context('which cannot be solved', function() {
      var problem = 'var 0..1: x; constraint x > 1; solve satisfy; output ["x -> ", show(x)];'

      it('should pass null as the output to the callback', function(done) {
        solve(problem, function(_, output) {
          expect(output).to.beNull;
          done();
        });
      });

      it('should return a falsy error value', function(done) {
        solve(problem, function(error) {
          expect(error).to.beFalsy
          done();
        });
      });
    });
  });

  context('with an invalid MiniZinc problem definition', function() {
    var problem = 'var 0..'

    it('should return a falsy output value', function(done) {
      solve(problem, function(_, output) {
        expect(output).to.beFalsy
        done();
      });
    });

    describe('the returned error', function() {
      it('should have the type "syntax_error"', function(done) {
        solve(problem, function(error) {
          expect(error).to.have.property('type', 'syntax_error');
          done();
        });
      });

      it('should have a message that states the line number of the problem', function(done) {
        solve(problem, function(error) {
          expect(error.message).to.match(/line.+1/i);
          done();
        });
      });

      it('should have a message that mentions minizinc syntax', function(done) {
        solve(problem, function(error) {
          expect(error.message).to.match(/minizinc.*error.+syntax/i);
          done();
        });
      });
    });
  });
});

# minizinc-solver

A javascript library to priovide an API to a constraints solver using the
MiniZinc constraints modelling language.

## Why

Constraints programming provides some powerful techniques to solve certain sets
of problems. Many solvers exist, but not many seem to have javascript bindings.
This library provides an API to solve problems specified in the MiniZinc
modelling language so that this can be more easily integrated in larger programs.

## Example

```javascript
var solver = require('minizinc-solver');

var problem = buildMiniZincProblemString();
solver.solve(problem).then(doSomethingWithProblemOutput);
```

## Usage


### `solve(minizincProblem: string, callback: (error?, result: string) => void): void`

It takes a string containing a problem specified in the MiniZinc language and
returns a Promise, which may return one of three ways:
* succeed with a `string` containing the output of the problem
** The format of the output is defined within the MiniZinc problem using the
normal "output" command
* succeed with `null` if the problem cannot be solved
* fail with an error of the following form if there is a syntax error:
`{ type: 'syntax_error', message: <string> }`
* fail with an error of the following form if the problem is not solved within 30 seconds:
`{ type: 'timeout_error', message: <string> }`

Typescript definitions are also provided.

### `solveWithTimeout(minizincProblem: string, timeoutInMillis: number, callback: (error?, result: string) => void): void`

This is the same as `solve` except that the timeout time can be specified.

## Installation

This depends on having a minizinc installation already.

1. Install the binaries for your system [here](https://www.minizinc.org/ide/).
2. Add the binaries to your `PATH`: `export PATH=$PATH:/path/to/MiniZincIDE-2.2.3-bundle-linux/bin`
3. Install this library: `npm install minizinc-solver`

## Testing

Tests are written using Mocha and Chai. To run them, use:

`npm test`

## License

[MIT](./LICENSE)

This project uses a [MiniZinc](http://www.minizinc.org/) compiler to translate
constraints into a language that solvers can understand. Source code for the
MiniZinc tool chain is available at http://www.minizinc.org/2.0/index.html.

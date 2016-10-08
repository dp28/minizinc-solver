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

A single method is provided with the signature:

`solve(minizincProblem: string): Promise<string>`

It takes a string containing a problem specified in the MiniZinc language and
returns a Promise for the string output of the problem. The format of the output
is defined within the MiniZinc problem using the normal "output" command.

## Installation

This library is only suitable for 64-bit Linux due o the version of the
underlying MiniZinc command line version. To install this library, run:

`npm install minizinc-solver`

## License

[MIT](./LICENSE)

This project uses a [MiniZinc](http://www.minizinc.org/) compiler to translate
constraints into a language that solvers can understand. Source code for the
MiniZinc tool chain is available at http://www.minizinc.org/2.0/index.html.

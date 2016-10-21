export function solve(minizincProblem: string, callback: (error: any, result: string) => void): void;

export function solveWithTimeout(
  minizincProblem: string,
  timeoutInMillis: number,
  callback: (error: any, result: string) => void
): void;

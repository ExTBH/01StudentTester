import exp from "constants";

export type Question = {
  name: string;
  attrs: {
    subject: string; // absloute markdown path
    allowedFunctions: string[];
    baseSkills: {
      prog: 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;
    };
    expectedFiles: string[];
    group: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  };

  index: number;
};

export type Checkpoint = {
  children: {
    [key: string]: Question;
  };
};

export type Run = {
  question: Question;
  code: string;
};

export type RunResult = {
  passed: boolean;
  output: string;
}
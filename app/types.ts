export type Question = {
    name: string;
    attrs: {
        subject: string; // absloute markdown path
        allowedFunctions: string[];
        baseSkills: {
            prog: 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100;
        };
        expectedFiles: string[];
    };
    
    index: number;
}

export type Checkpoint = {
    children: {
        [key: string]: Question;
    };
}
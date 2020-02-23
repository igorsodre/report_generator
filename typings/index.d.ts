interface IGitLogOutput {
    commit: string;
    author: string;
    date: string;
    message: string;
    files: string[];
}

type TFileComplexity = 'BAIXA' | 'MEDIA' | 'ALTA' | null;
type TFileCategory = 'TEST' | 'JAVA' | 'JAVASCRIPT' | 'KEY_VALUE' | 'CSS' | 'HTML' | 'SCALA' | 'OUTRO';

type TWorksheetComplexityCell = {
    description: string;
    USTBB_A: number;
    USTBB_M: number;
};
type TWorksheetCell = {
    A: string;
    M: string;
    BAIXA: TWorksheetComplexityCell;
    MEDIA: TWorksheetComplexityCell;
    ALTA: TWorksheetComplexityCell;
};
type TWorksheetAttributes = {
    [key in TFileCategory]?: TWorksheetCell;
};


export interface LiteraryDevice {
  device: string;
  example: string;
  effect: string;
}

export interface ExamQuestion {
  question: string;
  marks: number;
  modelAnswer: string;
  keyPoints: string[];
}

export interface AnalysisResult {
  title: string;
  author: string;
  ocrContent: string;
  tone: {
    description: string;
    effects: string;
  };
  structure: string;
  context: string;
  personalResponse: string;
  literaryDevices: LiteraryDevice[];
  meaning: {
    explicit: string;
    implicit: string;
  };
  examQuestions: ExamQuestion[];
  cieEvaluation: {
    ao1: string;
    ao2: string;
    ao3: string;
    ao4: string;
    totalMark: number;
    maxMark: number;
    grade: string;
    examinerComments: string;
  };
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

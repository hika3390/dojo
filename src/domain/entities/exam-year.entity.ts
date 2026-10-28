export type ExamSource = {
  page: string;
  am: string;
  pm: string;
  answers: string;
};

export type ExamYear = {
  year: number;
  label: string;
  source: ExamSource;
};

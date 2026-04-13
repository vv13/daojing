export type ExplanationType = 'philosophical' | 'practical' | 'historical' | 'poetic';

export interface Explanation {
  type: ExplanationType;
  label: string;
  content: string[];
}

export interface Chapter {
  id: number;
  title: string;
  original: string[];
  plain: string[];
  explanations: Explanation[];
}

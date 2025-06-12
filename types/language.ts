export type Language = 'zh';

export interface LanguageState {
  t: (key: string) => string;
}
export interface TranspileResult {
  transpiled_code: string;
  explanation: string[];
  detected_constructs: string[];
  language: string;
  success: boolean;
  error: string | null;
}

export interface EmojiExample {
  title: string;
  description: string;
  emoji_code: string;
}

export type TargetLanguage = "python" | "javascript" | "java";

export interface ExecutionResult {
  output: string;
  error: string | null;
}

export interface EmojiKeywordGroup {
  name: string;
  emojis: EmojiKeyword[];
}

export interface EmojiKeyword {
  emoji: string;
  meaning: string;
  category: string;
}

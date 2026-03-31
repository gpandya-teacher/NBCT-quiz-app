import type {
  WritingPromptRecord,
  WritingValidationResult,
} from "./types";

export function countWords(value: string): number {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

export function validateResponseText(value: string): WritingValidationResult {
  const errors: string[] = [];
  const wordCount = countWords(value);

  if (!value.trim()) {
    errors.push("Response is required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    wordCount,
  };
}

export function validatePromptRecord(
  prompt: WritingPromptRecord | null | undefined,
): string[] {
  const errors: string[] = [];

  if (!prompt) {
    errors.push("Prompt data is missing.");
    return errors;
  }

  if (!prompt.id) {
    errors.push("Prompt id is missing.");
  }

  if (!prompt.promptText?.trim()) {
    errors.push("Prompt text is missing.");
  }

  return errors;
}

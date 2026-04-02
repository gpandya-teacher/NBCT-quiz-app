import renalFullDataset from "../../../../data/renal/renal_full_dataset.json";
import renalGeneratedQuestionBank from "../../../../data/renal/renal_generated_question_bank.json";
import renalTrapRecognitionRaw from "../../../../data/renal/renal_trap_recognition.csv?raw";
import renalAnkiImportRaw from "../../../../data/renal/renal_anki_import.tsv?raw";
import renalStudyGuideRaw from "../../../../data/renal/renal_study_guide.md?raw";
import renalHighYieldRulesRaw from "../../../../data/renal/renal_high_yield_rules.md?raw";
import { parseDelimitedText, parseMarkdownSections } from "./parsers";

function slugifyTopic(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getRenalTopics() {
  return Array.from(
    new Set(renalFullDataset.map((item) => item.topic).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));
}

export function getRenalFullDataset() {
  return renalFullDataset.map((item) => ({
    id: `renal-full-${item.qid}`,
    qid: item.qid,
    topic: item.topic,
    subject: item.subject,
    prompt: item.learning_summary || item.bottom_line || item.explanation,
    explanation: item.explanation,
    bottomLine: item.bottom_line,
    answerLetter: item.answer_letter,
    answerText: item.answer_text,
    choices: Object.entries(item.options ?? {})
      .filter(([, text]) => text)
      .map(([id, text]) => ({
        id,
        text,
      })),
  }));
}

export function getRenalGeneratedQuestionBank() {
  return renalGeneratedQuestionBank.map((item) => ({
    ...item,
    topicSlug: slugifyTopic(item.topic),
  }));
}

export function getRenalTrapRecognitionRows() {
  return parseDelimitedText(renalTrapRecognitionRaw, ",").map((item, index) => ({
    id: `renal-trap-${item.qid || index + 1}`,
    ...item,
  }));
}

export function getRenalFlashcards() {
  return parseDelimitedText(renalAnkiImportRaw, "\t").map((item, index) => ({
    id: `renal-card-${index + 1}`,
    front: Object.values(item)[0] ?? "",
    back: Object.values(item)[1] ?? "",
    deck: Object.values(item)[2] ?? "",
  }));
}

export function getRenalStudyGuideSections() {
  return parseMarkdownSections(renalStudyGuideRaw);
}

export function getRenalHighYieldRuleSections() {
  return parseMarkdownSections(renalHighYieldRulesRaw);
}

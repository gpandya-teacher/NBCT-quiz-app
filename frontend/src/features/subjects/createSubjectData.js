import { parseDelimitedText, parseMarkdownSections } from "./parsers";

function slugifyTopic(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toLookupKey(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return String(value).trim();
}

function extractOriginalQuestionNumber(item) {
  const originalId = String(item.original_id ?? item.original_question_number ?? "").trim();
  const match = originalId.match(/^(\d+)/);
  return match ? match[1] : null;
}

function buildManifestLookups(manifestEntries) {
  const byQuestionNumber = new Map();
  const bySequence = new Map();

  for (const entry of manifestEntries) {
    const questionNumberKey = toLookupKey(entry.question_number);
    const sequenceKey = toLookupKey(entry.sequence);

    if (questionNumberKey) {
      const current = byQuestionNumber.get(questionNumberKey) ?? [];
      current.push(entry);
      byQuestionNumber.set(questionNumberKey, current);
    }

    if (sequenceKey) {
      const current = bySequence.get(sequenceKey) ?? [];
      current.push(entry);
      bySequence.set(sequenceKey, current);
    }
  }

  return { byQuestionNumber, bySequence };
}

function resolveQuestionImages({ item, manifestLookups, imageMap }) {
  const matchedEntries = [];
  const seenManifestPaths = new Set();
  const matchCandidates = [
    { source: "questionNumber", key: toLookupKey(item.qid) },
    { source: "questionNumber", key: extractOriginalQuestionNumber(item) },
    { source: "sequence", key: toLookupKey(item.sequence) },
  ];

  for (const candidate of matchCandidates) {
    if (!candidate.key) {
      continue;
    }

    const lookup =
      candidate.source === "questionNumber"
        ? manifestLookups.byQuestionNumber
        : manifestLookups.bySequence;
    const matches = lookup.get(candidate.key) ?? [];

    if (matches.length > 1) {
      continue;
    }

    for (const entry of matches) {
      if (!entry?.image_path || seenManifestPaths.has(entry.image_path)) {
        continue;
      }

      seenManifestPaths.add(entry.image_path);
      matchedEntries.push(entry);
    }

    if (matchedEntries.length) {
      break;
    }
  }

  const manifestImages = matchedEntries
    .map((entry) => imageMap[entry.image_path] ?? null)
    .filter(Boolean);

  const explicitImages = Array.isArray(item.question_images)
    ? item.question_images
        .map((imagePath) => imageMap[imagePath] ?? null)
        .filter(Boolean)
    : [];

  return Array.from(new Set([...manifestImages, ...explicitImages]));
}

export function createSubjectData({
  subjectId,
  subjectTitle,
  fullDataset,
  generatedQuestionBank,
  ankiImportRaw,
  studyGuideRaw,
  highYieldRulesRaw,
  trapRecognitionRaw = null,
  manifestEntries = [],
  imageMap = {},
}) {
  const manifestLookups = buildManifestLookups(manifestEntries);
  const topics = Array.from(
    new Set(fullDataset.map((item) => item.topic).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));

  return {
    subjectId,
    subjectTitle,
    trapRecognitionAvailable: Boolean(trapRecognitionRaw),
    getTopics() {
      return topics;
    },
    getFullDataset() {
      return fullDataset.map((item) => ({
        id: `${subjectId}-full-${item.qid}`,
        qid: item.qid,
        topic: item.topic,
        subject: item.subject,
        prompt: item.stem || item.learning_summary || item.bottom_line || item.explanation,
        explanation: item.explanation,
        bottomLine: item.bottom_line,
        answerLetter: item.answer_letter,
        answerText: item.answer_text,
        questionImages: resolveQuestionImages({
          item,
          manifestLookups,
          imageMap,
        }),
        choices: Object.entries(item.options ?? {})
          .filter(([, text]) => text)
          .map(([id, text]) => ({
            id,
            text,
          })),
      }));
    },
    getGeneratedQuestionBank() {
      return generatedQuestionBank.map((item) => ({
        ...item,
        topicSlug: slugifyTopic(item.topic),
      }));
    },
    getTrapRecognitionRows() {
      if (!trapRecognitionRaw) {
        return [];
      }

      return parseDelimitedText(trapRecognitionRaw, ",").map((item, index) => ({
        id: `${subjectId}-trap-${item.qid || index + 1}`,
        ...item,
      }));
    },
    getFlashcards() {
      return parseDelimitedText(ankiImportRaw, "\t").map((item, index) => ({
        id: `${subjectId}-card-${index + 1}`,
        front: Object.values(item)[0] ?? "",
        back: Object.values(item)[1] ?? "",
        deck: Object.values(item)[2] ?? "",
      }));
    },
    getStudyGuideSections() {
      return parseMarkdownSections(studyGuideRaw);
    },
    getHighYieldRuleSections() {
      return parseMarkdownSections(highYieldRulesRaw);
    },
  };
}

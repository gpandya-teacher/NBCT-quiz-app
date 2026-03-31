import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(
  __dirname,
  "../data/nbpts_prompts_production.json",
);

const DEFAULT_DURATION_SECONDS = 30 * 60;
const activePromptSessions = new Map();

function shuffle(items) {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

function normalizePrompt(record) {
  if (
    !record ||
    typeof record.id === "undefined" ||
    !record.prompt_text
  ) {
    return null;
  }

  return {
    id: String(record.id),
    domain: record.domain ?? "general",
    domainFocus: String(record.domain_focus ?? "").trim(),
    category: String(record.category ?? "").trim(),
    promptText: String(record.prompt_text).trim(),
    sentenceStarter: String(record.sentence_starter ?? "").trim(),
    idealStructure: Array.isArray(record.ideal_structure)
      ? record.ideal_structure.map((item) => String(item).trim()).filter(Boolean)
      : [],
    idealAnswer: String(record.sentence_starter ?? "").trim(),
    keywords: Array.isArray(record.keywords)
      ? record.keywords.map((keyword) => String(keyword).trim()).filter(Boolean)
      : [],
    rubric: Array.isArray(record.scoring_rubric)
      ? Object.fromEntries(
          record.scoring_rubric.map((item, index) => [
            String(index + 1),
            `${item.criterion}: ${item.description}`,
          ]),
        )
      : {},
    isActive: record.is_active !== false,
  };
}

function loadPrompts() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const parsed = JSON.parse(raw);

  return parsed
    .map(normalizePrompt)
    .filter((item) => item && item.isActive);
}

function countWords(value) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function buildKeywordSummary(responseText, prompt) {
  const normalizedResponse = responseText.toLowerCase();

  const matches = prompt.keywords.map((keyword) => ({
    keyword,
    matched: normalizedResponse.includes(keyword.toLowerCase()),
  }));

  return {
    matched: matches.filter((item) => item.matched).length,
    total: matches.length,
    items: matches,
  };
}

function buildRuleSummary(responseText, prompt) {
  const normalizedResponse = responseText.toLowerCase();
  const inferredRules = [
    {
      rule: "keyword_coverage",
      weight: prompt.keywords.length,
      matchedKeywords: prompt.keywords.filter((keyword) =>
        normalizedResponse.includes(keyword.toLowerCase()),
      ),
    },
    {
      rule: "response_length",
      weight: 1,
      matchedKeywords: responseText.trim().split(/\s+/).length >= 40 ? ["40+ words"] : [],
    },
  ];

  return inferredRules.map((item) => ({
    rule: item.rule,
    weight: item.weight,
    matched: item.matchedKeywords.length > 0,
    evidence: item.matchedKeywords.join(", "),
  }));
}

function estimateScore(ruleSummary, rubric) {
  const rubricLevels = Object.keys(rubric)
    .map((key) => Number(key))
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => left - right);
  const maxRubricScore = rubricLevels.at(-1) ?? 4;
  const keywordRule = ruleSummary.find((item) => item.rule === "keyword_coverage");
  const matchedKeywordCount = keywordRule?.evidence
    ? keywordRule.evidence.split(", ").filter(Boolean).length
    : 0;
  const keywordRatio =
    matchedKeywordCount / Math.max(1, keywordRule?.weight ?? 1);
  const estimatedScore = Math.min(
    maxRubricScore,
    Math.round(keywordRatio * maxRubricScore),
  );

  return {
    estimatedScore,
    maxRubricScore,
    performanceLabel: rubric[String(estimatedScore)] ?? "",
  };
}

const promptBank = loadPrompts();

export function createWrittenPromptSession() {
  const selectedPrompt = shuffle(promptBank)[0];
  const sessionId = crypto.randomUUID();

  activePromptSessions.set(sessionId, {
    promptId: selectedPrompt.id,
    draft: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return {
    sessionId,
    durationSeconds: DEFAULT_DURATION_SECONDS,
    prompt: {
      id: selectedPrompt.id,
      domain: selectedPrompt.domain,
      domainFocus: selectedPrompt.domainFocus,
      category: selectedPrompt.category,
      promptText: selectedPrompt.promptText,
      sentenceStarter: selectedPrompt.sentenceStarter,
      idealStructure: selectedPrompt.idealStructure,
      keywords: selectedPrompt.keywords,
      ideal_answer: selectedPrompt.idealAnswer,
      rubric: selectedPrompt.rubric,
    },
  };
}

export function autosaveWrittenPrompt(sessionId, responseText = "") {
  const session = activePromptSessions.get(sessionId);

  if (!session) {
    return null;
  }

  session.draft = responseText;
  session.updatedAt = Date.now();

  return {
    sessionId,
    savedAt: session.updatedAt,
    wordCount: countWords(responseText),
  };
}

export function submitWrittenPrompt(sessionId, responseText = "") {
  const session = activePromptSessions.get(sessionId);

  if (!session) {
    return null;
  }

  const prompt = promptBank.find((item) => item.id === session.promptId);

  if (!prompt) {
    return null;
  }

  const userResponse = responseText || session.draft || "";
  const keywordSummary = buildKeywordSummary(userResponse, prompt);
  const ruleSummary = buildRuleSummary(userResponse, prompt);
  const scoreEstimate = estimateScore(ruleSummary, prompt.rubric);
  const rubricBreakdown = Object.entries(prompt.rubric)
    .map(([score, description]) => ({
      score: Number(score),
      description,
      achieved: Number(score) <= scoreEstimate.estimatedScore,
    }))
    .sort((left, right) => left.score - right.score);

  activePromptSessions.delete(sessionId);

  return {
    sessionId,
    prompt: {
      id: prompt.id,
      domain: prompt.domain,
      domainFocus: prompt.domainFocus,
      category: prompt.category,
      promptText: prompt.promptText,
      sentenceStarter: prompt.sentenceStarter,
      idealStructure: prompt.idealStructure,
      keywords: prompt.keywords,
      ideal_answer: prompt.idealAnswer,
      rubric: prompt.rubric,
    },
    userResponse,
    idealAnswer: prompt.idealAnswer,
    rubricBreakdown,
    keywordSummary,
    ruleSummary,
    scoreEstimate,
    submittedAt: Date.now(),
    wordCount: countWords(userResponse),
  };
}

export function getWrittenPromptStats() {
  return {
    totalPrompts: promptBank.length,
    defaultDurationSeconds: DEFAULT_DURATION_SECONDS,
  };
}

import mskData from "../data/msk/msk_full_dataset.json";
import pharmaData from "../data/pharma/Pharma_full_dataset.json";
import neuroData from "../data/neuro/Neuro_full_dataset.json";

/**
 * IMPORTANT:
 * This service converts the rebuilt dataset format:
 *   {
 *     qid,
 *     stem,
 *     options: { A: "...", B: "...", ... },
 *     answer_letter,
 *     answer_text,
 *     explanation,
 *     bottom_line
 *   }
 *
 * into the old UI format expected by the app:
 *   {
 *     id,
 *     question,
 *     choices: [{ id: "A", text: "..." }, ...],
 *     correctChoiceId,
 *     explanation,
 *     bottomLine
 *   }
 */

const SUBJECT_DATASETS = {
  MSK: Array.isArray(mskData) ? mskData : [],
  Pharma: Array.isArray(pharmaData) ? pharmaData : [],
  Neuro: Array.isArray(neuroData) ? neuroData : [],
};

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeChoices(optionsObject) {
  if (!optionsObject || typeof optionsObject !== "object") {
    return [];
  }

  return Object.entries(optionsObject)
    .filter(([key, value]) => typeof value === "string" && value.trim() !== "")
    .map(([key, value]) => ({
      id: String(key).trim().toUpperCase(),
      key: String(key).trim().toUpperCase(),
      text: value.trim(),
    }));
}

function inferCorrectAnswerText(question, choices) {
  if (typeof question.answer_text === "string" && question.answer_text.trim()) {
    return question.answer_text.trim();
  }

  const answerLetter = String(question.answer_letter || "")
    .trim()
    .toUpperCase();

  const matched = choices.find((choice) => choice.id === answerLetter);
  return matched?.text || "";
}

function normalizeQuestion(rawQuestion, subjectName, index) {
  const choices = normalizeChoices(rawQuestion.options);
  const correctChoiceId = String(rawQuestion.answer_letter || "")
    .trim()
    .toUpperCase();

  const correctAnswerText = inferCorrectAnswerText(rawQuestion, choices);

  return {
    id: `${subjectName}-${rawQuestion.qid ?? index + 1}`,
    qid: rawQuestion.qid ?? index + 1,
    originalId: rawQuestion.original_id || "",
    subject: rawQuestion.subject || subjectName,
    topic: rawQuestion.topic || "General",
    topicTag: (rawQuestion.topic || "General").replace(/\s+/g, "_"),
    difficultyTag: "STANDARD",

    question: rawQuestion.stem || "",
    stem: rawQuestion.stem || "",

    choices,
    options: choices,

    correctChoiceId,
    correctAnswer: correctChoiceId,
    correctText: correctAnswerText,
    answerText: correctAnswerText,

    explanation:
      typeof rawQuestion.explanation === "string"
        ? rawQuestion.explanation.trim()
        : "",

    bottomLine:
      typeof rawQuestion.bottom_line === "string"
        ? rawQuestion.bottom_line.trim()
        : "",

    stimulus: "",
    passage: "",
    context: "",
    scenario: "",

    questionImages: Array.isArray(rawQuestion.question_images)
      ? rawQuestion.question_images
      : [],
  };
}

function buildCombinedQuestionBank() {
  const combined = [];

  Object.entries(SUBJECT_DATASETS).forEach(([subjectName, dataset]) => {
    dataset.forEach((question, index) => {
      combined.push(normalizeQuestion(question, subjectName, index));
    });
  });

  return combined;
}

const QUESTION_BANK = buildCombinedQuestionBank();

function selectQuestions(questionLimit, subject) {
  let pool = QUESTION_BANK;

  if (subject && SUBJECT_DATASETS[subject]) {
    pool = SUBJECT_DATASETS[subject].map((q, index) =>
      normalizeQuestion(q, subject, index),
    );
  }

  if (!pool.length) {
    return [];
  }

  const shuffled = shuffle(pool);

  if (!questionLimit || Number.isNaN(Number(questionLimit))) {
    return shuffled;
  }

  return shuffled.slice(0, Number(questionLimit));
}

export async function createLocalQuizSession(questionLimit = 20, subject = null) {
  const questions = selectQuestions(questionLimit, subject);

  if (!questions.length) {
    return {
      quizId: `local-${Date.now()}`,
      durationSeconds: 0,
      totalQuestions: 0,
      questions: [],
    };
  }

  return {
    quizId: `local-${Date.now()}`,
    durationSeconds: Math.max(questions.length * 75, 300),
    totalQuestions: questions.length,
    questions,
  };
}

export function gradeLocalQuizSession(quiz, answersSnapshot = {}) {
  if (!quiz || !Array.isArray(quiz.questions)) {
    return null;
  }

  let score = 0;

  const review = quiz.questions.map((question, index) => {
    const selectedChoiceId = answersSnapshot[question.id] ?? null;
    const isCorrect = selectedChoiceId === question.correctChoiceId;

    if (isCorrect) {
      score += 1;
    }

    const correctChoice =
      question.choices.find(
        (choice) => choice.id === question.correctChoiceId,
      ) || null;

    const selectedChoice =
      question.choices.find(
        (choice) => choice.id === selectedChoiceId,
      ) || null;

    return {
      id: question.id,
      questionNumber: index + 1,
      question: question.question,
      topicTag: question.topicTag,
      difficultyTag: question.difficultyTag,
      choices: question.choices,
      selectedChoiceId,
      correctChoiceId: question.correctChoiceId,
      selectedChoiceText: selectedChoice?.text || "",
      correctChoiceText:
        question.correctText || correctChoice?.text || "",
      explanation: question.explanation || "",
      bottomLine: question.bottomLine || "",
      isCorrect,
    };
  });

  const percentage =
    quiz.totalQuestions > 0
      ? Math.round((score / quiz.totalQuestions) * 100)
      : 0;

  return {
    score,
    totalQuestions: quiz.totalQuestions,
    percentage,
    review,
  };
}
const QUESTION_COUNT_DEFAULT = 20;
const SECONDS_PER_QUESTION = 45;
const ANSWER_PREFIX_PATTERN = /^[A-D](?:[\.\)]|\s+)\s*/i;
let questionBankPromise = null;

function shuffle(items) {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

function cleanChoiceText(value) {
  return String(value ?? "")
    .trim()
    .replace(ANSWER_PREFIX_PATTERN, "")
    .replace(/([a-z0-9\)])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeQuestion(item) {
  const optionMap = {
    A: cleanChoiceText(item.option_a),
    B: cleanChoiceText(item.option_b),
    C: cleanChoiceText(item.option_c),
    D: cleanChoiceText(item.option_d),
  };

  const correctAnswer = String(item.correct_answer ?? "").trim().toUpperCase();
  const choiceIds = ["A", "B", "C", "D"];
  const allChoicesPresent = choiceIds.every((id) => optionMap[id]);

  if (!allChoicesPresent || !choiceIds.includes(correctAnswer)) {
    return null;
  }

  return {
    id: item.id,
    question: String(item.question ?? "").trim(),
    topicTag: item.topic_tag ?? "general",
    difficultyTag: item.difficulty_tag ?? "unknown",
    sourceReference: item.source_reference ?? "",
    choices: choiceIds.map((id) => ({
      id,
      text: optionMap[id],
    })),
    correctChoiceId: correctAnswer,
  };
}

async function loadQuestionBank() {
  if (!questionBankPromise) {
    questionBankPromise = import("../../../backend/data/nbct_question_bank_405_v2_cleaned.json")
      .then((module) => module.default ?? [])
      .then((items) =>
        items
          .filter((item) => item.item_type === "mcq")
          .map(normalizeQuestion)
          .filter(Boolean),
      );
  }

  return questionBankPromise;
}

export async function createLocalQuizSession(limit = QUESTION_COUNT_DEFAULT) {
  const questionBank = await loadQuestionBank();

  if (!questionBank.length) {
    return null;
  }

  const safeLimit = Math.max(
    1,
    Math.min(Number(limit) || QUESTION_COUNT_DEFAULT, questionBank.length),
  );
  const selectedQuestions = shuffle(questionBank)
    .slice(0, safeLimit)
    .map((question) => ({
      ...question,
      choices: shuffle(question.choices),
    }));

  return {
    quizId: crypto.randomUUID(),
    durationSeconds: safeLimit * SECONDS_PER_QUESTION,
    totalQuestions: selectedQuestions.length,
    questions: selectedQuestions,
  };
}

export function gradeLocalQuizSession(quiz, answersByQuestionId = {}) {
  if (!quiz?.questions?.length) {
    return null;
  }

  let score = 0;

  const review = quiz.questions.map((question) => {
    const selectedChoiceId = answersByQuestionId[question.id] ?? null;
    const isCorrect = selectedChoiceId === question.correctChoiceId;

    if (isCorrect) {
      score += 1;
    }

    return {
      questionId: question.id,
      question: question.question,
      topicTag: question.topicTag,
      difficultyTag: question.difficultyTag,
      choices: question.choices,
      selectedChoiceId,
      correctChoiceId: question.correctChoiceId,
      correctAnswerText:
        question.choices.find((choice) => choice.id === question.correctChoiceId)?.text ?? "",
      isCorrect,
    };
  });

  return {
    quizId: quiz.quizId,
    score,
    totalQuestions: quiz.questions.length,
    percentage: Math.round((score / quiz.questions.length) * 100),
    review,
  };
}

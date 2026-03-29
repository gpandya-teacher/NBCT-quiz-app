import { useEffect, useMemo, useRef, useState } from "react";
import BottomControlBar from "./BottomControlBar";
import ExamShell from "./ExamShell";
import MCQOptionRow from "./MCQOptionRow";
import QuestionNavigator from "./QuestionNavigator";
import ReviewList from "./ReviewList";
import TopBar from "./TopBar";
import { fetchApi } from "../lib/api";

function shuffle(items) {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function buildStudyFeedbackMessage(question, didAnswerCorrectly) {
  const correctChoice = question.choices.find(
    (choice) => choice.id === question.correctChoiceId,
  );

  if (didAnswerCorrectly) {
    return "Correct. This response matches the keyed answer.";
  }

  return `Incorrect. Correct answer: ${correctChoice?.text ?? ""}`;
}

function renderChoiceLabel(index) {
  return String.fromCharCode(65 + index);
}

export default function MultipleChoiceMode({
  mode,
  onBack,
  requestHeaders,
  onBlocked,
}) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [studyResponses, setStudyResponses] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const latestAnswersRef = useRef({});
  const latestQuizIdRef = useRef(null);
  const submitStartedRef = useRef(false);
  const isStudyMode = mode.tone === "study";

  useEffect(() => {
    loadQuiz();
  }, [mode.questionLimit]);

  useEffect(() => {
    latestAnswersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    latestQuizIdRef.current = quiz?.quizId ?? null;
  }, [quiz]);

  useEffect(() => {
    if (!quiz) {
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setFeedbackMessage("");
      return;
    }

    const currentQuestionId = quiz.questions[currentIndex]?.id;

    if (!isStudyMode) {
      setSelectedAnswer(currentQuestionId ? answers[currentQuestionId] ?? null : null);
      setShowFeedback(false);
      setIsCorrect(false);
      setFeedbackMessage("");
      return;
    }

    const existingResponse = currentQuestionId
      ? studyResponses[currentQuestionId]
      : null;

    setSelectedAnswer(existingResponse?.selectedAnswer ?? null);
    setShowFeedback(existingResponse?.showFeedback ?? false);
    setIsCorrect(existingResponse?.isCorrect ?? false);
    setFeedbackMessage(existingResponse?.feedbackMessage ?? "");
  }, [quiz, currentIndex, answers, studyResponses, isStudyMode]);

  useEffect(() => {
    submitStartedRef.current = isSubmitting;
  }, [isSubmitting]);

  useEffect(() => {
    if (!quiz || result || secondsRemaining <= 0 || isSubmitting) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setSecondsRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [quiz, result, secondsRemaining, isSubmitting]);

  useEffect(() => {
    if (quiz && !result && secondsRemaining === 0 && !isSubmitting) {
      submitQuiz({
        quizId: latestQuizIdRef.current,
        answersSnapshot: latestAnswersRef.current,
      });
    }
  }, [quiz, result, secondsRemaining, isSubmitting]);

  async function loadQuiz() {
    setIsLoading(true);
    setErrorMessage("");
    setResult(null);
    setAnswers({});
    setStudyResponses({});
    setFlaggedQuestions({});
    setCurrentIndex(0);
    setSecondsRemaining(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setFeedbackMessage("");
    latestAnswersRef.current = {};
    latestQuizIdRef.current = null;
    submitStartedRef.current = false;

    try {
      const response = await fetchApi(`/api/quiz?limit=${mode.questionLimit}`, {
        headers: requestHeaders,
      });

      if (response.status === 401 || response.status === 402 || response.status === 403) {
        const payload = await response.json();
        onBlocked(payload);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to start the quiz.");
      }

      const payload = await response.json();
      setQuiz({
        ...payload,
        questions: payload.questions.map((question) => ({
          ...question,
          choices: shuffle(question.choices),
        })),
      });
      setSecondsRemaining(payload.durationSeconds);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function submitQuiz(options = {}) {
    const targetQuizId = options.quizId ?? quiz?.quizId;
    const targetAnswers = options.answersSnapshot ?? answers;

    if (!targetQuizId || submitStartedRef.current) {
      return;
    }

    submitStartedRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetchApi("/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...requestHeaders,
        },
        body: JSON.stringify({
          quizId: targetQuizId,
          answers: Object.entries(targetAnswers).map(
            ([questionId, selectedChoiceId]) => ({
              questionId,
              selectedChoiceId,
            }),
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to submit the quiz.");
      }

      const payload = await response.json();
      setResult(payload);
    } catch (error) {
      submitStartedRef.current = false;
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentQuestion = quiz?.questions[currentIndex] ?? null;
  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );
  const flaggedCount = useMemo(
    () => Object.values(flaggedQuestions).filter(Boolean).length,
    [flaggedQuestions],
  );
  const progressPercentage = quiz
    ? Math.round(((currentIndex + 1) / quiz.totalQuestions) * 100)
    : 0;
  const canGoNext = isStudyMode ? showFeedback : true;

  function handleSelect(choiceId) {
    if (!currentQuestion) {
      return;
    }

    if (isStudyMode && studyResponses[currentQuestion.id]) {
      return;
    }

    const correctChoiceId = currentQuestion.correctChoiceId;
    const nextIsCorrect = choiceId === correctChoiceId;
    const nextFeedbackMessage = isStudyMode
      ? buildStudyFeedbackMessage(currentQuestion, nextIsCorrect)
      : "";

    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: choiceId,
    }));

    if (isStudyMode) {
      setSelectedAnswer(choiceId);
      setShowFeedback(true);
      setIsCorrect(nextIsCorrect);
      setFeedbackMessage(nextFeedbackMessage);
      setStudyResponses((current) => ({
        ...current,
        [currentQuestion.id]: {
          selectedAnswer: choiceId,
          showFeedback: true,
          isCorrect: nextIsCorrect,
          feedbackMessage: nextFeedbackMessage,
        },
      }));

      if (nextIsCorrect) {
        setScore((current) => current + 1);
      }
    }
  }

  function handleNext() {
    if (!quiz) {
      return;
    }

    if (currentIndex === quiz.totalQuestions - 1) {
      submitQuiz();
      return;
    }

    setCurrentIndex((index) => Math.min(index + 1, quiz.totalQuestions - 1));
  }

  function handlePrevious() {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  function toggleFlag() {
    if (!currentQuestion) {
      return;
    }

    setFlaggedQuestions((current) => ({
      ...current,
      [currentQuestion.id]: !current[currentQuestion.id],
    }));
  }

  function getOptionVariant(choice) {
    const isSelected = selectedAnswer === choice.id;
    const isChoiceCorrect = currentQuestion?.correctChoiceId === choice.id;

    if (showFeedback && isStudyMode) {
      if (isChoiceCorrect) {
        return "correct";
      }

      if (isSelected && !isCorrect) {
        return "incorrect";
      }

      return "neutral";
    }

    if (isSelected) {
      return "selected";
    }

    return "neutral";
  }

  const navigatorData = quiz
    ? {
        questionIds: quiz.questions.map((question) => question.id),
        byId: answers,
      }
    : { questionIds: [], byId: {} };

  const topBar = (
    <TopBar
      title="NBCT Component 1"
      sectionTitle={isStudyMode ? "Multiple Choice Section" : "Multiple Choice Section"}
      centerContent={
        <div className="flex items-center gap-4 text-[12px] text-slate-600">
          <span>Item {currentIndex + 1} of {quiz?.totalQuestions ?? 0}</span>
          <span>{progressPercentage}% complete</span>
          {isStudyMode ? <span>Study feedback enabled</span> : <span>Exam review enabled</span>}
        </div>
      }
      rightContent={
        <>
          <div className="border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700">
            Time {formatTime(secondsRemaining)}
          </div>
          <div className="border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700">
            Flagged {flaggedCount}
          </div>
        </>
      }
    />
  );

  if (isLoading) {
    return (
      <ExamShell
        topBar={topBar}
        sidebar={<div className="border border-slate-300 bg-white p-4 text-[14px] text-slate-600">Loading section...</div>}
        bottomBar={<BottomControlBar leftContent={null} rightContent={null} />}
      >
        <div className="border border-slate-300 bg-white p-6 text-slate-700">
          Loading {mode.title}...
        </div>
      </ExamShell>
    );
  }

  if (errorMessage) {
    return (
      <ExamShell
        topBar={topBar}
        sidebar={null}
        bottomBar={
          <BottomControlBar
            leftContent={
              <button
                type="button"
                onClick={onBack}
                className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
              >
                Back Home
              </button>
            }
            rightContent={
              <button
                type="button"
                onClick={loadQuiz}
                className="border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white"
              >
                Retry Section
              </button>
            }
          />
        }
      >
        <div className="border border-rose-300 bg-white p-6">
          <h1 className="text-[20px] font-bold text-slate-900">Unable to load section</h1>
          <p className="mt-3 text-[14px] text-slate-700">{errorMessage}</p>
        </div>
      </ExamShell>
    );
  }

  if (result) {
    return (
      <ExamShell
        topBar={
          <TopBar
            title="NBCT Component 1"
            sectionTitle="Multiple Choice Section Review"
            centerContent={<div className="text-[12px] text-slate-600">Section submitted</div>}
            rightContent={
              <div className="border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700">
                Score {result.score}/{result.totalQuestions}
              </div>
            }
          />
        }
        sidebar={
          <div className="border border-slate-300 bg-white">
            <div className="border-b border-slate-300 px-4 py-3">
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Section Summary
              </p>
            </div>
            <div className="space-y-3 px-4 py-4 text-[14px]">
              <p className="text-[28px] font-bold text-slate-900">
                {result.score}/{result.totalQuestions}
              </p>
              <p className="text-slate-600">{result.percentage}% correct</p>
              <p className="text-slate-600">
                Review each item below before starting another section.
              </p>
            </div>
          </div>
        }
        bottomBar={
          <BottomControlBar
            leftContent={
              <button
                type="button"
                onClick={onBack}
                className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
              >
                Back Home
              </button>
            }
            rightContent={
              <button
                type="button"
                onClick={loadQuiz}
                className="border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white"
              >
                Start New Section
              </button>
            }
          />
        }
      >
        <ReviewList review={result.review} />
      </ExamShell>
    );
  }

  const sidebar = quiz ? (
    <QuestionNavigator
      totalQuestions={quiz.totalQuestions}
      currentIndex={currentIndex}
      answers={navigatorData}
      flaggedQuestions={flaggedQuestions}
      onSelectQuestion={setCurrentIndex}
    />
  ) : null;

  const bottomBar = (
    <BottomControlBar
      leftContent={
        <>
          <button
            type="button"
            onClick={onBack}
            className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
          >
            Exit
          </button>
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            hidden={!canGoNext}
            className="border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white"
          >
            {currentIndex === (quiz?.totalQuestions ?? 1) - 1 ? "End Section" : "Next"}
          </button>
          <button
            type="button"
            onClick={toggleFlag}
            className={`border px-4 py-2 text-[13px] font-semibold ${
              currentQuestion && flaggedQuestions[currentQuestion.id]
                ? "border-amber-500 bg-amber-50 text-amber-800"
                : "border-slate-300 text-slate-700"
            }`}
          >
            Flag for Review
          </button>
        </>
      }
      rightContent={
        <button
          type="button"
          onClick={submitQuiz}
          disabled={isSubmitting}
          className="border border-slate-900 px-4 py-2 text-[13px] font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Section"}
        </button>
      }
    />
  );

  return (
    <ExamShell topBar={topBar} sidebar={sidebar} bottomBar={bottomBar}>
      {currentQuestion ? (
        <div className="space-y-4">
          <div className="border border-slate-300 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] uppercase tracking-[0.12em] text-slate-500">
              <span>Topic: {currentQuestion.topicTag.replaceAll("_", " ")}</span>
              <span>Difficulty: {currentQuestion.difficultyTag}</span>
              <span>Item {currentIndex + 1}</span>
            </div>
          </div>

          <div className="border border-slate-300 bg-white px-4 py-5">
            <h1 className="text-[20px] font-bold leading-8 text-slate-900">
              {currentQuestion.question}
            </h1>

            <div className="mt-5 space-y-3">
              {currentQuestion.choices.map((choice, index) => (
                <MCQOptionRow
                  key={`${currentQuestion.id}-${choice.id}-${index}`}
                  label={renderChoiceLabel(index)}
                  text={choice.text}
                  onSelect={() => handleSelect(choice.id)}
                  disabled={isStudyMode && showFeedback}
                  variant={getOptionVariant(choice)}
                />
              ))}
            </div>

            {showFeedback && isStudyMode ? (
              <div
                className={`mt-4 border px-4 py-3 text-[14px] leading-6 ${
                  isCorrect
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-rose-300 bg-rose-50 text-rose-900"
                }`}
              >
                {feedbackMessage}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </ExamShell>
  );
}

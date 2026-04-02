import { useEffect, useMemo, useRef, useState } from "react";
import BottomNavigation from "./BottomNavigation";
import ExamLayout from "./ExamLayout";
import ExamSubHeader from "./ExamSubHeader";
import PassagePanel from "./PassagePanel";
import QuestionNavigator from "./QuestionNavigator";
import QuestionPanel from "./QuestionPanel";
import ReviewList from "./ReviewList";
import TopExamHeader from "./TopExamHeader";
import { createLocalQuizSession, gradeLocalQuizSession } from "../lib/localQuizService";

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${minutes}:${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function buildStudyFeedbackMessage(question, didAnswerCorrectly) {
  const correctChoice = question.choices.find(
    (choice) => choice.id === question.correctChoiceId,
  );

  if (didAnswerCorrectly) {
    return "This response matches the keyed answer for this item.";
  }

  return `The keyed response is ${correctChoice?.text ?? ""}.`;
}

function renderChoiceLabel(index) {
  return String.fromCharCode(65 + index);
}

function buildPassageSections(question, mode, currentIndex, totalQuestions, flagged) {
  const sourceText =
    question.stimulus ||
    question.passage ||
    question.context ||
    question.scenario ||
    "Read the prompt, review the item information, and select the best answer based on the teaching situation presented.";

  return [
    {
      heading: "Section Directions",
      paragraphs: [
        `You are working in ${mode.title}. Review the reference material, then answer Question ${currentIndex + 1} of ${totalQuestions}.`,
        "Choose the single best answer. Use the navigation controls to move between questions or mark an item for review.",
      ],
    },
    {
      heading: "Stimulus / Reference",
      paragraphs: Array.isArray(sourceText) ? sourceText : [sourceText],
    },
    {
      heading: "Item Details",
      paragraphs: [
        `Topic: ${question.topicTag.replaceAll("_", " ")}`,
        `Difficulty: ${question.difficultyTag}`,
        flagged ? "Status: Marked for review" : "Status: Not marked",
      ],
    },
  ];
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
  const [showTimer, setShowTimer] = useState(true);
  const latestAnswersRef = useRef({});
  const latestQuizIdRef = useRef(null);
  const submitStartedRef = useRef(false);
  const loadRequestRef = useRef(0);
  const isStudyMode = mode.tone === "study";

  useEffect(() => {
    loadQuiz();
  }, [mode.questionLimit]);

  useEffect(() => {
    return () => {
      loadRequestRef.current += 1;
    };
  }, []);

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
    if (quiz && quiz.totalQuestions > 0 && !result && secondsRemaining === 0 && !isSubmitting) {
      submitQuiz({
        quizId: latestQuizIdRef.current,
        answersSnapshot: latestAnswersRef.current,
      });
    }
  }, [quiz, result, secondsRemaining, isSubmitting]);

  async function loadQuiz() {
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
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
      const payload = await createLocalQuizSession(mode.questionLimit);

      if (!payload?.questions?.length) {
        throw new Error("No multiple-choice questions are available.");
      }

      if (loadRequestRef.current !== requestId) {
        return;
      }

      setQuiz(payload);
      setSecondsRemaining(payload.durationSeconds);
    } catch (error) {
      if (loadRequestRef.current === requestId) {
        setErrorMessage(error.message);
      }
    } finally {
      if (loadRequestRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }

  async function submitQuiz(options = {}) {
    const targetAnswers = options.answersSnapshot ?? answers;

    if (!quiz || submitStartedRef.current) {
      return;
    }

    submitStartedRef.current = true;
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = gradeLocalQuizSession(quiz, targetAnswers);

      if (!payload) {
        throw new Error("Unable to submit the quiz.");
      }
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
  const canAdvance = isStudyMode ? showFeedback : true;

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

    if (isStudyMode && !showFeedback) {
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

  function handleReviewAction() {
    submitQuiz();
  }

  function handleHelpAction() {
    window.alert(
      "Use Mark to flag the current question. Use Back and Next to move through the section. Submit or Review when you are ready to end the section.",
    );
  }

  const navigatorData = quiz
    ? {
        questionIds: quiz.questions.map((question) => question.id),
        byId: answers,
      }
    : { questionIds: [], byId: {} };

  const selectedLabel = currentQuestion?.choices.findIndex(
    (choice) => choice.id === selectedAnswer,
  );

  const topHeader = (
    <TopExamHeader
      title="NBCT Component 1"
      examLabel="Multiple Choice Examination"
      onExit={onBack}
      onMark={toggleFlag}
      onReview={handleReviewAction}
      onHelp={handleHelpAction}
      onBack={handlePrevious}
      onNext={handleNext}
      canGoBack={currentIndex > 0}
      canGoNext={Boolean(quiz) && (!isStudyMode || canAdvance)}
      isFlagged={Boolean(currentQuestion && flaggedQuestions[currentQuestion.id])}
    />
  );

  const subHeader = (
    <ExamSubHeader
      sectionLabel={isStudyMode ? "Study Section" : "Exam Section"}
      progressLabel={`Question ${currentIndex + 1} of ${quiz?.totalQuestions ?? 0}`}
      timeLabel={`Time ${formatTime(secondsRemaining)}`}
      onToggleTime={() => setShowTimer((current) => !current)}
      timerHidden={!showTimer}
      statusLabel={`${answeredCount} answered | ${flaggedCount} marked`}
    />
  );

  if (isLoading) {
    return (
      <ExamLayout
        topHeader={topHeader}
        subHeader={subHeader}
        leftPanel={
          <div className="border border-slate-400 bg-white p-5 text-[14px] text-slate-600">
            Loading section materials...
          </div>
        }
        rightPanel={
          <div className="border border-slate-400 bg-white p-6 text-slate-700">
            Loading {mode.title}...
          </div>
        }
        bottomNavigation={<BottomNavigation selectedLabel={null} leftActions={[]} rightActions={[]} />}
      />
    );
  }

  if (errorMessage) {
    return (
      <ExamLayout
        topHeader={topHeader}
        subHeader={subHeader}
        leftPanel={
          <div className="border border-slate-400 bg-white p-5 text-[14px] text-slate-600">
            Section materials unavailable.
          </div>
        }
        rightPanel={
          <div className="border border-slate-400 bg-white p-6">
            <h1 className="text-[20px] font-bold text-slate-900">Unable to load section</h1>
            <p className="mt-3 text-[14px] text-slate-700">{errorMessage}</p>
          </div>
        }
        bottomNavigation={
          <BottomNavigation
            selectedLabel={null}
            leftActions={[
              { label: "Exit", onClick: onBack },
              { label: "Retry", onClick: loadQuiz, tone: "primary" },
            ]}
            rightActions={[]}
          />
        }
      />
    );
  }

  if (result) {
    return (
      <ExamLayout
        topHeader={
          <TopExamHeader
            title="NBCT Component 1"
            examLabel="Multiple Choice Section Review"
            onExit={onBack}
            onMark={() => {}}
            onReview={() => {}}
            onHelp={handleHelpAction}
            onBack={() => {}}
            onNext={() => {}}
            canGoBack={false}
            canGoNext={false}
            isFlagged={false}
          />
        }
        subHeader={
          <ExamSubHeader
            sectionLabel="Review"
            progressLabel={`Score ${result.score} of ${result.totalQuestions}`}
            timeLabel={`Correct ${result.percentage}%`}
            onToggleTime={() => {}}
            timerHidden={false}
            statusLabel="Section submitted"
          />
        }
        leftPanel={
          <div className="border border-slate-400 bg-white">
            <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                Section Summary
              </p>
            </div>
            <div className="space-y-3 px-4 py-5 text-[14px] text-slate-700">
              <p className="text-[30px] font-bold text-slate-900">
                {result.score}/{result.totalQuestions}
              </p>
              <p>{result.percentage}% correct</p>
              <p>
                Review each item below. You can return home or begin a new section when ready.
              </p>
            </div>
          </div>
        }
        rightPanel={<ReviewList review={result.review} />}
        bottomNavigation={
          <BottomNavigation
            selectedLabel={null}
            leftActions={[{ label: "Back Home", onClick: onBack }]}
            rightActions={[{ label: "New Section", onClick: loadQuiz, tone: "primary" }]}
          />
        }
      />
    );
  }

  const leftPanel = currentQuestion ? (
    <PassagePanel
      title="Passage / Reference"
      sections={buildPassageSections(
        currentQuestion,
        mode,
        currentIndex,
        quiz?.totalQuestions ?? 0,
        Boolean(flaggedQuestions[currentQuestion.id]),
      )}
      navigator={
        quiz ? (
          <QuestionNavigator
            totalQuestions={quiz.totalQuestions}
            currentIndex={currentIndex}
            answers={navigatorData}
            flaggedQuestions={flaggedQuestions}
            onSelectQuestion={setCurrentIndex}
          />
        ) : null
      }
    />
  ) : null;

  const rightPanel = currentQuestion ? (
    <QuestionPanel
      question={currentQuestion}
      currentIndex={currentIndex}
      totalQuestions={quiz?.totalQuestions ?? 0}
      selectedAnswer={selectedAnswer}
      showFeedback={showFeedback}
      isStudyMode={isStudyMode}
      isCorrect={isCorrect}
      feedbackMessage={feedbackMessage}
      onSelectChoice={handleSelect}
      getOptionVariant={getOptionVariant}
    />
  ) : null;

  return (
    <ExamLayout
      topHeader={topHeader}
      subHeader={subHeader}
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      bottomNavigation={
        <BottomNavigation
          selectedLabel={
            selectedLabel !== -1 && selectedLabel !== undefined && selectedLabel !== null
              ? renderChoiceLabel(selectedLabel)
              : null
          }
          leftActions={[
            { label: "Previous", onClick: handlePrevious, disabled: currentIndex === 0 },
            {
              label: currentIndex === (quiz?.totalQuestions ?? 1) - 1 ? "End Section" : "Next",
              onClick: handleNext,
              disabled: !canAdvance,
              tone: "primary",
            },
          ]}
          rightActions={[
            {
              label: currentQuestion && flaggedQuestions[currentQuestion.id] ? "Marked" : "Mark",
              onClick: toggleFlag,
            },
            {
              label: isSubmitting ? "Submitting..." : "Submit Section",
              onClick: submitQuiz,
              disabled: isSubmitting,
            },
          ]}
        />
      }
    />
  );
}

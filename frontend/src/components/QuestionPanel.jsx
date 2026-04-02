import ChoiceList from "./ChoiceList";

export default function QuestionPanel({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  showFeedback,
  isStudyMode,
  isCorrect,
  feedbackMessage,
  onSelectChoice,
  getOptionVariant,
}) {
  return (
    <div className="border border-slate-400 bg-white">
      <div className="border-b border-slate-300 bg-slate-100 px-5 py-4">
        <div className="flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.1em] text-slate-500">
          <span>Question {currentIndex + 1}</span>
          <span>{question.topicTag.replaceAll("_", " ")}</span>
          <span>{question.difficultyTag}</span>
          <span>{selectedAnswer ? "Response recorded" : "No response selected"}</span>
        </div>
      </div>

      <div className="px-5 py-5">
        <h1 className="text-[21px] font-bold leading-8 text-slate-900">
          {question.question}
        </h1>

        <div className="mt-6">
          <ChoiceList
            choices={question.choices}
            selectedAnswer={selectedAnswer}
            onSelectChoice={onSelectChoice}
            disabled={isStudyMode && showFeedback}
            getOptionVariant={getOptionVariant}
          />
        </div>

        {showFeedback && isStudyMode ? (
          <div
            className={`mt-5 border px-4 py-3 text-[14px] leading-6 ${
              isCorrect
                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                : "border-red-400 bg-red-50 text-red-900"
            }`}
          >
            <p className="font-semibold">
              {isCorrect ? "Correct response recorded." : "Incorrect response recorded."}
            </p>
            <p className="mt-1">{feedbackMessage}</p>
          </div>
        ) : null}

        {!showFeedback || !isStudyMode ? (
          <div className="mt-5 text-[13px] text-slate-600">
            Select one answer choice to continue. Review controls are available in the header and navigator.
          </div>
        ) : null}
      </div>
    </div>
  );
}

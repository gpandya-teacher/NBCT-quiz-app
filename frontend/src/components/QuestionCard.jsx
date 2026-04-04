export default function QuestionCard({
  question,
  selectedChoiceId,
  correctChoiceId,
  onSelect,
  onNext,
  onPrevious,
  canGoPrevious,
  isLastQuestion,
  tone = "study",
  showFeedback = false,
  isCorrect = false,
  disableSelection = false,
  hideNextButton = false,
  feedbackMessage = "",
  questionNumber,
  totalQuestions,
}) {
  const isExamTone = tone === "exam";
  const choices = question.choices || question.options || [];

  return (
    <section className="border border-slate-300 bg-white">
      <div className="border-b border-slate-300 bg-slate-50 px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-800">
              Item {questionNumber} of {totalQuestions}
            </span>
            <span className="text-slate-500">
              Topic: {(question.topicTag || question.topic || "General").replaceAll("_", " ")}
            </span>
          </div>
          <span className="font-medium uppercase tracking-[0.18em] text-slate-500">
            {question.difficultyTag || "STANDARD"}
          </span>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-7">
        <h2 className="text-xl font-semibold leading-8 text-slate-900 sm:text-2xl">
          {question.question || question.stem}
        </h2>

        <div className="mt-6 space-y-3">
          {choices.map((choice, index) => {
            const choiceValue = choice.id || choice.key;
            const isSelected = selectedChoiceId === choiceValue;
            const isChoiceCorrect = correctChoiceId === choiceValue;
            const displayLabel = choice.key || String.fromCharCode(65 + index);
            let choiceClassName = "";

            if (showFeedback) {
              if (isChoiceCorrect) {
                choiceClassName =
                  "border-emerald-600 bg-emerald-600 text-white";
              } else if (isSelected && !isCorrect) {
                choiceClassName = "border-rose-600 bg-rose-600 text-white";
              } else {
                choiceClassName = "border-slate-200 bg-white text-ink";
              }
            } else if (isSelected) {
              choiceClassName = "border-pine bg-pine text-white";
            } else if (isExamTone) {
              choiceClassName =
                "border-slate-300 bg-[#fffefb] text-ink hover:border-slate-500";
            } else {
              choiceClassName =
                "border-slate-200 bg-white text-ink hover:border-clay hover:bg-sand/70";
            }

            return (
              <button
                key={choiceValue}
                type="button"
                onClick={() => onSelect(choiceValue)}
                disabled={disableSelection}
                className={`w-full border px-4 py-4 text-left transition disabled:cursor-not-allowed ${choiceClassName}`}
              >
                <span className="mr-4 inline-flex h-8 w-8 items-center justify-center border border-current text-sm font-bold">
                  {displayLabel}
                </span>
                <span className="align-middle leading-7">{choice.text}</span>
              </button>
            );
          })}
        </div>

        {showFeedback && feedbackMessage ? (
          <div
            className={`mt-5 border px-4 py-3 text-sm leading-6 ${
              isCorrect
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-rose-300 bg-rose-50 text-rose-900"
            }`}
          >
            {feedbackMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            hidden={hideNextButton}
            className="bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            {isLastQuestion ? "Finish Section" : "Next Question"}
          </button>
        </div>
      </div>
    </section>
  );
}
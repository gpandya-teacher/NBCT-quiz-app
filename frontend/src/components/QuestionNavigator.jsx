function getButtonClasses({ isCurrent, isAnswered, isFlagged }) {
  if (isCurrent) {
    return "border-[#163968] bg-[#163968] text-white";
  }

  if (isFlagged) {
    return "border-[#9a6700] bg-[#fef3c7] text-[#854d0e]";
  }

  if (isAnswered) {
    return "border-slate-400 bg-slate-200 text-slate-900";
  }

  return "border-slate-300 bg-white text-slate-700 hover:bg-slate-100";
}

export default function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answers,
  flaggedQuestions,
  onSelectQuestion,
}) {
  return (
    <div className="border border-slate-400 bg-white">
      <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-600">
          Question Navigator
        </p>
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const questionId = answers.questionIds?.[index];
            const isAnswered = questionId ? Boolean(answers.byId[questionId]) : false;
            const isFlagged = questionId ? Boolean(flaggedQuestions[questionId]) : false;

            return (
              <button
                key={index + 1}
                type="button"
                onClick={() => onSelectQuestion(index)}
                className={`h-9 w-9 border text-[12px] font-semibold ${getButtonClasses({
                  isCurrent: index === currentIndex,
                  isAnswered,
                  isFlagged,
                })}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-2 text-[11px] uppercase tracking-[0.08em] text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 border border-[#163968] bg-[#163968]" />
            Current
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 border border-slate-400 bg-slate-200" />
            Answered
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 border border-[#9a6700] bg-[#fef3c7]" />
            Marked
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 border border-slate-300 bg-white" />
            Unanswered
          </div>
        </div>
      </div>
    </div>
  );
}

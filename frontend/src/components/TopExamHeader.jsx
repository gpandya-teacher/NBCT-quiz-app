function HeaderButton({ label, onClick, disabled = false, tone = "default" }) {
  const tones = {
    default: "border-[#7f95b7] bg-[#163968] text-white hover:bg-[#1c467d]",
    ghost: "border-[#7f95b7] bg-[#23497a] text-white hover:bg-[#2a558d]",
    primary: "border-[#9eb3d3] bg-[#f8fafc] text-[#102742] hover:bg-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[72px] border px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      {label}
    </button>
  );
}

export default function TopExamHeader({
  title,
  examLabel,
  onExit,
  onMark,
  onReview,
  onHelp,
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  isFlagged,
}) {
  return (
    <div className="border-b border-[#0e2340] bg-[#163968] text-white">
      <div className="mx-auto flex h-[56px] max-w-[1500px] items-center justify-between gap-3 px-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border border-[#7f95b7] bg-[#0f2745] text-[11px] font-bold uppercase tracking-[0.12em]">
            NB
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c8d4e8]">
              {title}
            </p>
            <p className="truncate text-[15px] font-semibold text-white">
              {examLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <HeaderButton label="Exit Section" onClick={onExit} tone="ghost" />
          <HeaderButton
            label={isFlagged ? "Marked" : "Mark"}
            onClick={onMark}
            tone={isFlagged ? "primary" : "default"}
          />
          <HeaderButton label="Review" onClick={onReview} tone="ghost" />
          <HeaderButton label="Help" onClick={onHelp} tone="ghost" />
          <HeaderButton label="Back" onClick={onBack} disabled={!canGoBack} />
          <HeaderButton label="Next" onClick={onNext} disabled={!canGoNext} tone="primary" />
        </div>
      </div>
    </div>
  );
}

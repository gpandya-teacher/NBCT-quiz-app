export default function ExamSubHeader({
  sectionLabel,
  progressLabel,
  timeLabel,
  onToggleTime,
  timerHidden,
  statusLabel,
}) {
  return (
    <div className="border-b border-slate-300 bg-[#dbe4ef]">
      <div className="mx-auto flex h-[44px] max-w-[1500px] items-center justify-between gap-3 px-3 text-[13px] text-slate-800">
        <div className="flex items-center gap-4">
          <span className="font-semibold uppercase tracking-[0.1em] text-[#334155]">
            {sectionLabel}
          </span>
          <span>{progressLabel}</span>
          {statusLabel ? <span className="text-slate-600">{statusLabel}</span> : null}
        </div>

        <div className="flex items-center gap-3">
          <span className="border border-slate-400 bg-white px-3 py-1 font-semibold">
            {timerHidden ? "Time Hidden" : timeLabel}
          </span>
          <button
            type="button"
            onClick={onToggleTime}
            className="border border-slate-400 bg-white px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-700"
          >
            {timerHidden ? "Show Time" : "Hide Time"}
          </button>
        </div>
      </div>
    </div>
  );
}

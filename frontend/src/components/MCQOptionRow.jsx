export default function MCQOptionRow({
  label,
  text,
  onSelect,
  disabled,
  isSelected = false,
  variant = "neutral",
}) {
  const variants = {
    neutral: "border-slate-400 bg-white text-slate-900 hover:bg-slate-50",
    selected: "border-[#163968] bg-[#e8eff8] text-slate-900",
    correct: "border-emerald-600 bg-emerald-50 text-emerald-900",
    incorrect: "border-red-500 bg-red-50 text-red-900",
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-disabled={disabled}
      aria-label={`Choice ${label}: ${text}`}
      onClick={onSelect}
      disabled={disabled}
      className={`flex w-full items-start gap-3 border px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant]}`}
    >
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current">
        <span
          className={`h-2 w-2 rounded-full ${
            variant === "selected" || variant === "correct" || variant === "incorrect"
              ? "bg-current"
              : "bg-transparent"
          }`}
        />
      </span>
      <span className="inline-flex min-w-[28px] shrink-0 justify-center border border-slate-400 bg-slate-50 px-1 py-0.5 text-[12px] font-semibold text-slate-700">
        {label}
      </span>
      <span className="leading-6">{text}</span>
    </button>
  );
}

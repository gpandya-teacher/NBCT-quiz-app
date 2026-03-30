function NavButton({ label, onClick, disabled = false, tone = "default" }) {
  const tones = {
    default: "border-slate-400 bg-white text-slate-800",
    primary: "border-[#163968] bg-[#163968] text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      {label}
    </button>
  );
}

export default function BottomNavigation({
  selectedLabel,
  leftActions,
  rightActions,
}) {
  return (
    <div className="border-t border-slate-400 bg-[#e5ebf3]">
      <div className="mx-auto flex min-h-[56px] max-w-[1500px] items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="border border-slate-400 bg-white px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-700">
            Selected Answer: {selectedLabel || "None"}
          </div>
          <div className="flex items-center gap-2">
            {leftActions.map((action) => (
              <NavButton key={action.label} {...action} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rightActions.map((action) => (
            <NavButton key={action.label} {...action} />
          ))}
        </div>
      </div>
    </div>
  );
}

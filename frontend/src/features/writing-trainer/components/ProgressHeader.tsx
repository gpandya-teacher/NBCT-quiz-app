type ProgressHeaderProps = {
  title: string;
  domain: string;
  secondsRemaining?: number | null;
  saveStatus?: string | null;
};

function formatTimer(secondsRemaining?: number | null) {
  if (typeof secondsRemaining !== "number" || Number.isNaN(secondsRemaining)) {
    return "--:--";
  }

  const minutes = Math.max(0, Math.floor(secondsRemaining / 60));
  const seconds = Math.max(0, secondsRemaining % 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function ProgressHeader({
  title,
  domain,
  secondsRemaining = null,
  saveStatus = null,
}: ProgressHeaderProps) {
  return (
    <section className="border border-slate-300 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {title}
          </p>
          <p className="mt-1 text-[14px] text-slate-700">Domain: {domain}</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-slate-500">Timer</p>
          <p className="text-[16px] font-semibold text-slate-900">
            {formatTimer(secondsRemaining)}
          </p>
          {saveStatus ? (
            <p className="mt-1 text-[12px] text-slate-500">{saveStatus}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ProgressHeader;

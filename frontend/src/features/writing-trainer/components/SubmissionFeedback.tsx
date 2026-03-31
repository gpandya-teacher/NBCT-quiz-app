import type { WritingSubmissionFeedback } from "../types";

type SubmissionFeedbackProps = {
  feedback: WritingSubmissionFeedback;
};

function CheckRow({ label, passed, detail }) {
  return (
    <div className="flex items-start justify-between gap-4 border border-slate-200 bg-slate-50 px-4 py-3">
      <div>
        <p className="text-[13px] font-semibold text-slate-900">{label}</p>
        {detail ? <p className="mt-1 text-[13px] text-slate-600">{detail}</p> : null}
      </div>
      <span
        className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${
          passed ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {passed ? "Identified" : "Missing"}
      </span>
    </div>
  );
}

export function SubmissionFeedback({ feedback }: SubmissionFeedbackProps) {
  return (
    <section className="border border-slate-300 bg-white">
      <header className="border-b border-slate-300 px-4 py-3">
        <p className="text-[14px] font-semibold text-slate-900">Writing Check</p>
      </header>

      <div className="space-y-3 px-4 py-4">
        <CheckRow
          label="Barrier"
          passed={feedback.writingCheck.barrier}
          detail="Did the response name the access barrier clearly?"
        />
        <CheckRow
          label="Evidence"
          passed={feedback.writingCheck.evidence}
          detail="Did the response point to evidence, supports, or concrete planning moves?"
        />
        <CheckRow
          label="Impact"
          passed={feedback.writingCheck.impact}
          detail="Did the response explain the student impact or expected outcome?"
        />
        <CheckRow
          label="SDI"
          passed={feedback.writingCheck.sdi}
          detail="Did the response identify SDI, accommodations, or specialized support?"
        />

        <div className="border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[13px] font-semibold text-slate-900">
            Power words used count
          </p>
          <p className="mt-1 text-[14px] text-slate-700">
            {feedback.writingCheck.powerWordsUsed.length} used
          </p>
          {feedback.writingCheck.powerWordsUsed.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {feedback.writingCheck.powerWordsUsed.map((word) => (
                <span
                  key={word}
                  className="border border-slate-300 bg-white px-2 py-1 text-[12px] font-semibold text-slate-700"
                >
                  {word}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default SubmissionFeedback;

import { useLayoutEffect, useRef } from "react";

type ResponseEditorProps = {
  value: string;
  onChange: (value: string) => void;
  wordCount: number;
  powerWords?: string[];
  sentenceStarter?: string;
  requiredElements?: string[];
  readOnly?: boolean;
};

export function ResponseEditor({
  value,
  onChange,
  wordCount,
  powerWords = [],
  sentenceStarter = "",
  requiredElements = [],
  readOnly = false,
}: ResponseEditorProps) {
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const minHeight = readOnly ? 120 : 220;
    const maxHeight = readOnly ? 420 : 560;

    textarea.style.height = "auto";
    const nextHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [readOnly, value]);

  return (
    <section className="w-full border border-slate-300 bg-white">
      <header className="flex items-center justify-between gap-4 border-b border-slate-300 px-4 py-3">
        <p className="text-[14px] font-semibold text-slate-900">Your Response</p>
        <span className="text-[12px] font-semibold text-slate-600">{wordCount} words</span>
      </header>

      <div className="px-4 py-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          className="w-full resize-none border border-slate-300 px-4 py-3 text-[15px] leading-7 text-slate-900 outline-none transition-[height] duration-150 ease-out focus:border-slate-500 read-only:bg-slate-50"
          placeholder={readOnly ? "" : "Write your response here."}
        />

        {!readOnly ? (
          <>
            <div className="mt-5 space-y-4">
              <section className="border border-slate-300 bg-white">
                <header className="border-b border-slate-300 px-4 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Power Words
                  </p>
                </header>
                <div className="px-4 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {powerWords.length ? (
                      powerWords.map((word) => (
                        <button
                          key={word}
                          type="button"
                          className="border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700"
                        >
                          {word}
                        </button>
                      ))
                    ) : (
                      <p className="text-[13px] text-slate-600">No power words provided.</p>
                    )}
                  </div>
                </div>
              </section>

              <section className="border border-slate-400 bg-slate-50">
                <header className="border-b border-slate-300 px-4 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Sentence Starter
                  </p>
                </header>
                <div className="px-4 py-4">
                  <p className="text-[13px] leading-6 text-slate-700">{sentenceStarter}</p>
                </div>
              </section>

              <section className="border border-slate-300 bg-white">
                <header className="border-b border-slate-300 px-4 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Required Elements Checklist
                  </p>
                </header>
                <div className="space-y-2.5 px-4 py-4">
                  {requiredElements.length ? (
                    requiredElements.map((item) => (
                      <label
                        key={item}
                        className="flex items-start gap-3 border border-slate-200 bg-slate-50 px-3 py-2.5"
                      >
                        <input type="checkbox" readOnly className="mt-1 h-4 w-4" />
                        <span className="text-[13px] leading-6 text-slate-700">{item}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-[13px] text-slate-600">No required elements provided.</p>
                  )}
                </div>
              </section>
            </div>

            <div className="mt-5 space-y-1 text-[13px] text-slate-700">
              <p>Name the barrier clearly</p>
              <p>Use at least 2 power words</p>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

export default ResponseEditor;

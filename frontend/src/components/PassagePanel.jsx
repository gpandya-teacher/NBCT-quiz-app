export default function PassagePanel({
  title,
  sections,
  navigator,
}) {
  return (
    <div className="flex h-full min-h-[calc(100vh-196px)] flex-col gap-3">
      <div className="min-h-0 flex-1 border border-slate-400 bg-white">
        <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-600">
            {title}
          </p>
        </div>

        <div className="max-h-[calc(100vh-260px)] space-y-5 overflow-y-auto px-4 py-4 text-[14px] leading-6 text-slate-800">
          {sections.map((section, index) => (
            <section key={`${section.heading}-${index}`}>
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {section.heading}
              </h2>
              <div className="mt-2 space-y-3">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div>{navigator}</div>
    </div>
  );
}

type PromptSupportsProps = {
  heading?: string;
  scenario: string;
  task: string;
  logic: string;
};

function Section({ title, children, highlighted = false }) {
  return (
    <section
      className={`border ${highlighted ? "border-slate-400 bg-slate-50" : "border-slate-300 bg-white"}`}
    >
      <header className="border-b border-slate-300 px-4 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {title}
        </p>
      </header>
      <div className="px-4 py-5">{children}</div>
    </section>
  );
}

export function PromptSupports({
  heading,
  scenario,
  task,
  logic,
}: PromptSupportsProps) {
  return (
    <div className="space-y-4">
      {heading ? (
        <div className="px-1 pb-1">
          <p className="text-[12px] text-slate-500">{heading}</p>
        </div>
      ) : null}

      <Section title="Scenario">
        <p className="text-[17px] font-medium leading-8 text-slate-900">{scenario}</p>
      </Section>

      <Section title="Task">
        <div className="space-y-3">
          <p className="text-[15px] leading-8 text-slate-800">{task}</p>
        </div>
      </Section>

      <Section title="1-Sentence Logic">
        <p className="text-[13px] leading-6 text-slate-700">{logic}</p>
      </Section>
    </div>
  );
}

export default PromptSupports;

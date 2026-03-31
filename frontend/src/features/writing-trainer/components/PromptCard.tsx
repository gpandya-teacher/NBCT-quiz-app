type PromptCardProps = {
  heading: string;
};

export function PromptCard({ heading }: PromptCardProps) {
  return (
    <section className="border border-slate-300 bg-white">
      <header className="border-b border-slate-300 px-4 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Prompt Title
        </p>
      </header>
      <div className="px-4 py-5">
        <p className="text-[20px] font-bold leading-8 text-slate-950">{heading}</p>
      </div>
    </section>
  );
}

export default PromptCard;

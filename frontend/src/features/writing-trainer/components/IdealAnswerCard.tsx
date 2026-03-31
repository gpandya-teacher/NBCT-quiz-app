type IdealAnswerCardProps = {
  idealAnswer: string;
};

export function IdealAnswerCard({ idealAnswer }: IdealAnswerCardProps) {
  return (
    <section className="border border-slate-300 bg-white">
      <header className="border-b border-slate-300 px-4 py-3">
        <p className="text-[14px] font-semibold text-slate-900">
          Model Answer
        </p>
      </header>
      <div className="px-4 py-4 text-[14px] leading-7 text-slate-800">
        {idealAnswer}
      </div>
    </section>
  );
}

export default IdealAnswerCard;

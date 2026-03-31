export default function ExamShell({
  topBar,
  sidebar,
  children,
  bottomBar,
}) {
  return (
    <main className="min-h-screen bg-[#f3f4f6] text-[15px] text-slate-900">
      <div className="fixed inset-x-0 top-0 z-30 border-b border-slate-300 bg-white">
        {topBar}
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pb-[104px] pt-[72px] sm:px-5">
        {sidebar ? (
          <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside>{sidebar}</aside>
            <section className="min-w-0">{children}</section>
          </div>
        ) : (
          <section className="min-w-0">{children}</section>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-300 bg-white">
        {bottomBar}
      </div>
    </main>
  );
}

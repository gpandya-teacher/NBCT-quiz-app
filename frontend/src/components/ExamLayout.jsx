export default function ExamLayout({
  topHeader,
  subHeader,
  leftPanel,
  rightPanel,
  bottomNavigation,
}) {
  return (
    <main className="min-h-screen bg-[#eef2f7] text-[15px] text-slate-900">
      <div className="fixed inset-x-0 top-0 z-40">{topHeader}</div>
      <div className="fixed inset-x-0 top-[56px] z-30">{subHeader}</div>

      <div className="mx-auto max-w-[1500px] px-3 pb-[86px] pt-[110px]">
        <div className="grid min-h-[calc(100vh-196px)] gap-3 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="min-h-0">{leftPanel}</aside>
          <section className="min-h-0">{rightPanel}</section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40">{bottomNavigation}</div>
    </main>
  );
}

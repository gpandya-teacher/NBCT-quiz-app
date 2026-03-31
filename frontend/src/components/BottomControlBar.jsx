export default function BottomControlBar({ leftContent, rightContent }) {
  return (
    <div className="mx-auto flex min-h-[64px] max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">{leftContent}</div>
      <div className="flex flex-wrap items-center justify-end gap-2">{rightContent}</div>
    </div>
  );
}

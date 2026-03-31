export default function HomeScreen({
  modes,
  onSelectMode,
  currentUser,
  usageSnapshot,
  authBypassed = false,
  onLogin,
  onSignup,
  onAccount,
  onLogout,
  onUpgrade,
  onAdmin,
}) {
  return (
    <main className="min-h-screen bg-[#f3f4f6] px-4 py-6 sm:px-5">
      <div className="mx-auto max-w-[1200px]">
        <section className="border border-slate-300 bg-white px-5 py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Access
              </p>
              <p className="mt-1 text-[14px] text-slate-700">
                {authBypassed
                  ? "Public access is temporarily enabled for this deployment."
                  : currentUser
                  ? `Signed in as ${currentUser.full_name}`
                  : "Anonymous free access available"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {authBypassed ? null : currentUser ? (
                <>
                  {currentUser.role === "admin" ? (
                    <button
                      type="button"
                      onClick={onAdmin}
                      className="border border-slate-300 px-3 py-2 text-[13px] font-semibold text-slate-700"
                    >
                      Admin
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={onAccount}
                    className="border border-slate-300 px-3 py-2 text-[13px] font-semibold text-slate-700"
                  >
                    Account
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="border border-slate-300 px-3 py-2 text-[13px] font-semibold text-slate-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onLogin}
                    className="border border-slate-300 px-3 py-2 text-[13px] font-semibold text-slate-700"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={onSignup}
                    className="border border-slate-900 bg-slate-900 px-3 py-2 text-[13px] font-semibold text-white"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
            NBCT Component 1 Prep
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <div>
              <h1 className="text-[28px] font-bold leading-9 text-slate-900">
                Choose a practice section.
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-700">
                Launch study, exam, or written-response practice from a single
                simulator workspace. Each mode keeps its own timing, feedback,
                and controls.
              </p>
            </div>
            <div className="border border-slate-300 bg-slate-50 px-4 py-4 text-[14px] text-slate-700">
              <p className="font-bold uppercase tracking-[0.16em] text-slate-500">
                Available Sections
              </p>
              <p className="mt-3">Multiple choice study and exam simulation</p>
              <p className="mt-2">Written response drafting and feedback</p>
              {authBypassed ? (
                <p className="mt-3 border-t border-slate-200 pt-3 text-[13px]">
                  Authentication is temporarily bypassed, so users can open practice
                  sections directly without signing in.
                </p>
              ) : (
                <>
                  <p className="mt-3 border-t border-slate-200 pt-3">
                    Free usage today: {usageSnapshot?.usage?.free_usage_count_today ?? 0}/
                    {usageSnapshot?.usage?.daily_limit ?? 1}
                  </p>
                  {currentUser ? (
                    <p className="mt-2 text-[13px]">
                      Email verified: {currentUser.email_verified ? "Yes" : "No"}
                    </p>
                  ) : null}
                  {currentUser ? (
                    <p className="mt-2 text-[13px]">
                      Upgrade status: {currentUser.upgrade_status ?? "none"}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[13px]">
                    {usageSnapshot?.has_unlimited_access
                      ? "Unlimited access is active."
                      : "Upgrade to unlimited access for $1/day."}
                  </p>
                  {!usageSnapshot?.has_unlimited_access ? (
                    <button
                      type="button"
                      onClick={onUpgrade}
                      className="mt-3 border border-slate-900 bg-slate-900 px-3 py-2 text-[13px] font-semibold text-white"
                    >
                      Upgrade
                    </button>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3 lg:grid-cols-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className="group border border-slate-300 bg-white px-5 py-5 text-left transition hover:border-slate-500"
            >
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {mode.eyebrow}
              </p>
              <h2 className="mt-3 text-[22px] font-bold text-slate-900">
                {mode.title}
              </h2>
              <p className="mt-3 text-[14px] leading-6 text-slate-700">
                {mode.description}
              </p>
              <span className="mt-5 inline-flex border border-slate-300 px-3 py-2 text-[13px] font-semibold text-slate-700 transition group-hover:border-slate-900 group-hover:text-slate-900">
                Enter Section
              </span>
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}

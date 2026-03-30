import { useState } from "react";

export default function AuthPage({
  mode,
  onSubmit,
  onBack,
  errorMessage,
  noticeMessage,
  onForgotPassword,
}) {
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const isSignup = mode === "signup";

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(formState);
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] px-4 py-8">
      <div className="mx-auto max-w-lg border border-slate-300 bg-white">
        <div className="border-b border-slate-300 px-5 py-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
            NBCT Component 1
          </p>
          <h1 className="mt-1 text-[22px] font-bold text-slate-900">
            {isSignup ? "Create Account" : "Log In"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {isSignup ? (
            <label className="block">
              <span className="mb-1 block text-[13px] font-semibold text-slate-700">
                Full name
              </span>
              <input
                value={formState.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className="w-full border border-slate-300 px-3 py-2"
                required
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">
              Email
            </span>
            <input
              type="email"
              value={formState.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full border border-slate-300 px-3 py-2"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">
              Password
            </span>
            <input
              type="password"
              value={formState.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="w-full border border-slate-300 px-3 py-2"
              minLength={8}
              required
            />
          </label>

          {!isSignup ? (
            <div className="text-right">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-[13px] font-semibold text-slate-700 underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>
          ) : null}

          {noticeMessage ? (
            <div className="border border-emerald-300 bg-emerald-50 px-3 py-2 text-[14px] text-emerald-800">
              {noticeMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="border border-rose-300 bg-rose-50 px-3 py-2 text-[14px] text-rose-800">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
            >
              Back
            </button>
            <button
              type="submit"
              className="border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white"
            >
              {isSignup ? "Create Account" : "Log In"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

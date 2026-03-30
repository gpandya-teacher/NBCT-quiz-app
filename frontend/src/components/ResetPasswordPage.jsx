import { useMemo, useState } from "react";

export default function ResetPasswordPage({ onBackToLogin, onSubmit }) {
  const token = useMemo(
    () => new URLSearchParams(window.location.search).get("token") ?? "",
    [],
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setMessage("");

    if (!token) {
      setErrorMessage("Reset token is missing.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit({
        token,
        newPassword,
      });
      setMessage(result.message);
      window.setTimeout(() => {
        onBackToLogin();
      }, 1200);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] px-4 py-8">
      <div className="mx-auto max-w-lg border border-slate-300 bg-white">
        <div className="border-b border-slate-300 px-5 py-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
            NBCT Component 1
          </p>
          <h1 className="mt-1 text-[22px] font-bold text-slate-900">
            Reset Password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">
              New password
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full border border-slate-300 px-3 py-2"
              minLength={8}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">
              Confirm password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full border border-slate-300 px-3 py-2"
              minLength={8}
              required
            />
          </label>

          {message ? (
            <div className="border border-emerald-300 bg-emerald-50 px-3 py-2 text-[14px] text-emerald-800">
              {message}
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
              onClick={onBackToLogin}
              className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
            >
              Back to Login
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

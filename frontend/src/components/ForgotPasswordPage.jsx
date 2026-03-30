import { useState } from "react";

export default function ForgotPasswordPage({ onBack, onSubmit }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setMessage("");

    try {
      const result = await onSubmit(email);
      setMessage(result.message);
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
            Forgot Password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <p className="text-[14px] text-slate-700">
            Enter your email address and we will send a password reset link if an account exists.
          </p>

          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-slate-300 px-3 py-2"
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
              onClick={onBack}
              className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

import { useEffect, useRef, useState } from "react";
import BottomControlBar from "./BottomControlBar";
import ExamShell from "./ExamShell";
import PromptPanel from "./PromptPanel";
import TopBar from "./TopBar";
import WritingPanel from "./WritingPanel";
import { fetchApi } from "../lib/api";

const LOCAL_DRAFT_PREFIX = "nbct-written-draft";

function getDraftKey(promptId) {
  return `${LOCAL_DRAFT_PREFIX}:${promptId}`;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function countWords(value) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function formatTimestamp(value) {
  if (!value) {
    return "Not saved";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function WrittenPromptMode({ onBack, requestHeaders, onBlocked }) {
  const [session, setSession] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [keywordResults, setKeywordResults] = useState(null);
  const [rubricResults, setRubricResults] = useState(null);
  const [scoreEstimate, setScoreEstimate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const latestTextRef = useRef("");
  const submitStartedRef = useRef(false);

  useEffect(() => {
    loadPrompt();
  }, []);

  useEffect(() => {
    latestTextRef.current = responseText;
  }, [responseText]);

  useEffect(() => {
    if (session?.prompt) {
      console.log("PROMPT DATA:", session.prompt);
    }
  }, [session]);

  useEffect(() => {
    if (!session || submitted || secondsRemaining <= 0 || isSubmitting) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setSecondsRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [session, submitted, secondsRemaining, isSubmitting]);

  useEffect(() => {
    if (session && !submitted && secondsRemaining === 0 && !isSubmitting) {
      submitResponse(latestTextRef.current);
    }
  }, [session, submitted, secondsRemaining, isSubmitting]);

  useEffect(() => {
    if (!session || submitted) {
      return undefined;
    }

    const autosaveId = window.setTimeout(() => {
      saveDraft(responseText);
    }, 1500);

    return () => window.clearTimeout(autosaveId);
  }, [session, responseText, submitted]);

  function resetWrittenState() {
    setSession(null);
    setResponseText("");
    setSecondsRemaining(0);
    setSubmitted(false);
    setShowFeedback(false);
    setFeedbackData(null);
    setKeywordResults(null);
    setRubricResults(null);
    setScoreEstimate(null);
    setIsSubmitting(false);
    setErrorMessage(null);
    setLastSavedAt(null);
    latestTextRef.current = "";
    submitStartedRef.current = false;
  }

  async function loadPrompt() {
    resetWrittenState();
    setIsLoading(true);

    try {
      const response = await fetchApi("/api/written-prompts/session", {
        headers: requestHeaders,
      });

      if (response.status === 401 || response.status === 402 || response.status === 403) {
        const blockedPayload = await response.json();
        onBlocked(blockedPayload);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load a written prompt.");
      }

      const payload = await response.json();
      const localDraft =
        window.localStorage.getItem(getDraftKey(payload.prompt.id)) ?? "";

      setSession(payload);
      setResponseText(localDraft);
      setSecondsRemaining(payload.durationSeconds);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveDraft(nextText) {
    if (!session || submitted) {
      return;
    }

    window.localStorage.setItem(getDraftKey(session.prompt.id), nextText);

    try {
      const response = await fetchApi("/api/written-prompts/autosave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...requestHeaders,
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          responseText: nextText,
        }),
      });

      if (!response.ok) {
        throw new Error("Autosave failed.");
      }

      const payload = await response.json();
      setLastSavedAt(payload.savedAt);
    } catch (_error) {
      setLastSavedAt(null);
    }
  }

  async function submitResponse(forcedText) {
    if (!session || submitStartedRef.current) {
      return;
    }

    const submissionText = forcedText ?? responseText;
    submitStartedRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await saveDraft(submissionText);

      const response = await fetchApi("/api/written-prompts/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...requestHeaders,
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          responseText: submissionText,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to submit the written response.");
      }

      const payload = await response.json();
      window.localStorage.removeItem(getDraftKey(session.prompt.id));
      setFeedbackData(payload);
      setKeywordResults(payload.keywordSummary ?? null);
      setRubricResults(payload.rubricBreakdown ?? null);
      setScoreEstimate(payload.scoreEstimate ?? null);
      setSubmitted(true);
      setShowFeedback(true);
    } catch (error) {
      submitStartedRef.current = false;
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const wordCount = countWords(responseText);

  const topBar = (
    <TopBar
      title="NBCT Component 1"
      sectionTitle="Written Response Practice"
      centerContent={
        <div className="text-[12px] text-slate-600">
          Domain: {submitted && feedbackData ? feedbackData.prompt.domain : session?.prompt.domain}
        </div>
      }
      rightContent={
        <>
          {!submitted ? (
            <>
              <div className="border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700">
                Time {formatTime(secondsRemaining)}
              </div>
              <div className="border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700">
                {wordCount} words
              </div>
              <div className="border border-slate-300 px-3 py-1.5 text-[12px] text-slate-700">
                Saved {formatTimestamp(lastSavedAt)}
              </div>
            </>
          ) : (
            <div className="border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700">
              Feedback ready
            </div>
          )}
        </>
      }
    />
  );

  if (isLoading) {
    return (
      <ExamShell
        topBar={topBar}
        sidebar={null}
        bottomBar={<BottomControlBar leftContent={null} rightContent={null} />}
      >
        <div className="border border-slate-300 bg-white p-6 text-slate-700">
          Loading written response practice...
        </div>
      </ExamShell>
    );
  }

  if (errorMessage) {
    return (
      <ExamShell
        topBar={topBar}
        sidebar={null}
        bottomBar={
          <BottomControlBar
            leftContent={
              <button
                type="button"
                onClick={onBack}
                className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
              >
                Back Home
              </button>
            }
            rightContent={
              <button
                type="button"
                onClick={loadPrompt}
                className="border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white"
              >
                Retry Prompt
              </button>
            }
          />
        }
      >
        <div className="border border-rose-300 bg-white p-6">
          <h1 className="text-[20px] font-bold text-slate-900">Unable to load prompt</h1>
          <p className="mt-3 text-[14px] text-slate-700">{errorMessage}</p>
        </div>
      </ExamShell>
    );
  }

  if (submitted && showFeedback && !errorMessage && feedbackData) {
    return (
      <ExamShell
        topBar={topBar}
        sidebar={null}
        bottomBar={
          <BottomControlBar
            leftContent={
              <button
                type="button"
                onClick={onBack}
                className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
              >
                Back Home
              </button>
            }
            rightContent={
              <button
                type="button"
                onClick={loadPrompt}
                className="border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white"
              >
                New Written Prompt
              </button>
            }
          />
        }
      >
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="border border-slate-300 bg-white">
              <div className="border-b border-slate-300 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Prompt
                </p>
              </div>
              <div className="space-y-3 px-4 py-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Prompt {feedbackData.prompt.id}
                </p>
                <p className="text-[14px] text-slate-600">
                  Domain: {feedbackData.prompt.domain}
                </p>
                <p className="text-[20px] font-bold leading-8 text-slate-900">
                  {feedbackData.prompt.promptText}
                </p>
              </div>
            </div>

            <div className="border border-slate-300 bg-white">
              <div className="border-b border-slate-300 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Your Response
                </p>
              </div>
              <div className="px-4 py-4">
                <p className="whitespace-pre-wrap text-[14px] leading-7 text-slate-800">
                  {feedbackData.userResponse || "No response submitted."}
                </p>
              </div>
            </div>

            <div className="border border-slate-300 bg-white">
              <div className="border-b border-slate-300 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Ideal Answer
                </p>
              </div>
              <div className="px-4 py-4">
                <p className="whitespace-pre-wrap text-[14px] leading-7 text-slate-800">
                  {feedbackData.idealAnswer}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-slate-300 bg-white">
              <div className="border-b border-slate-300 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Score Estimate
                </p>
              </div>
              <div className="px-4 py-4">
                <p className="text-[28px] font-bold text-slate-900">
                  {scoreEstimate?.estimatedScore}/{scoreEstimate?.maxRubricScore}
                </p>
                <p className="mt-2 text-[14px] text-slate-600">
                  {scoreEstimate?.performanceLabel ||
                    "Review rubric and rule matches below."}
                </p>
              </div>
            </div>

            <div className="border border-slate-300 bg-white">
              <div className="border-b border-slate-300 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Keyword Match Summary
                </p>
              </div>
              <div className="px-4 py-4">
                <p className="text-[20px] font-bold text-slate-900">
                  {keywordResults?.matched}/{keywordResults?.total}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {keywordResults?.items.map((item) => (
                    <span
                      key={item.keyword}
                      className={`border px-2 py-1 text-[12px] font-semibold ${
                        item.matched
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-slate-300 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {item.keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-slate-300 bg-white">
              <div className="border-b border-slate-300 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Rubric Breakdown
                </p>
              </div>
              <div className="space-y-2 px-4 py-4">
                {rubricResults?.map((item) => (
                  <div
                    key={item.score}
                    className={`border px-3 py-3 ${
                      item.achieved
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-600">
                      Score {item.score}
                    </p>
                    <p className="mt-2 text-[14px] leading-6 text-slate-700">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-300 bg-white">
              <div className="border-b border-slate-300 px-4 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Rule-Based Estimate
                </p>
              </div>
              <div className="space-y-2 px-4 py-4">
                {feedbackData.ruleSummary.map((item) => (
                  <div
                    key={item.rule}
                    className={`border px-3 py-3 ${
                      item.matched
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-700">
                        {item.rule.replaceAll("_", " ")}
                      </p>
                      <span className="text-[12px] text-slate-500">
                        Weight {item.weight}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] leading-6 text-slate-700">
                      {item.matched
                        ? `Matched through "${item.evidence}".`
                        : "No clear matching language detected."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ExamShell>
    );
  }

  if (submitted) {
    return null;
  }

  return (
    <ExamShell
      topBar={topBar}
      sidebar={
        session ? (
          <PromptPanel
            domain={session.prompt.domain}
            promptId={session.prompt.id}
            promptText={session.prompt.promptText}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        ) : null
      }
      bottomBar={
        <BottomControlBar
          leftContent={
            <>
              <button
                type="button"
                onClick={onBack}
                className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
              >
                Back Home
              </button>
              <button
                type="button"
                onClick={() => saveDraft(responseText)}
                className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
              >
                Save Draft
              </button>
            </>
          }
          rightContent={
            <button
              type="button"
              onClick={() => submitResponse(responseText)}
              disabled={isSubmitting}
              className="border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Response"}
            </button>
          }
        />
      }
    >
      <WritingPanel
        responseText={responseText}
        onChange={setResponseText}
      />
    </ExamShell>
  );
}

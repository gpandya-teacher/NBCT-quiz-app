import { useEffect, useMemo, useRef, useState } from "react";
import BottomControlBar from "./BottomControlBar";
import ExamShell from "./ExamShell";
import TopBar from "./TopBar";
import WritingPromptTrainer from "../features/writing-trainer/WritingPromptTrainer";
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

function formatTimestamp(value) {
  if (!value) {
    return "Not saved";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildTrainerPrompt(session, feedbackData) {
  const sourcePrompt = feedbackData?.prompt ?? session?.prompt;

  if (!sourcePrompt) {
    return null;
  }

  const rubricValues = sourcePrompt.rubric
    ? Object.values(sourcePrompt.rubric)
    : [];
  const logicSentence = sourcePrompt.idealStructure?.[0] || rubricValues[0] || "";

  return {
    id: sourcePrompt.id,
    domain: sourcePrompt.domain,
    title: sourcePrompt.domainFocus || sourcePrompt.category || `Prompt ${sourcePrompt.id}`,
    promptText: sourcePrompt.promptText,
    scenario: sourcePrompt.promptText,
    task:
      sourcePrompt.idealStructure?.length
        ? sourcePrompt.idealStructure.join(" ")
        : "Write a focused instructional response that addresses the scenario and explains your plan clearly.",
    logic: logicSentence,
    sentenceStarter: sourcePrompt.sentenceStarter || sourcePrompt.ideal_answer || "",
    powerWords: sourcePrompt.keywords ?? [],
    idealAnswer: feedbackData?.idealAnswer ?? sourcePrompt.idealAnswer ?? "",
    keywords: feedbackData?.keywords ?? sourcePrompt.keywords ?? [],
    rubric: feedbackData?.rubric ?? sourcePrompt.rubric ?? [],
    supports: Array.isArray(sourcePrompt.idealStructure)
      ? sourcePrompt.idealStructure.map((item, index) => ({
          id: `required-${index + 1}`,
          label: `Required ${index + 1}`,
          content: item,
        }))
      : [],
  };
}

function buildFeedbackModel({
  responseText,
  keywordResults,
  rubricResults,
  scoreEstimate,
  powerWords,
}) {
  if (!keywordResults && !rubricResults && !scoreEstimate) {
    return null;
  }

  const normalizedResponse = responseText.toLowerCase();
  const matchedItems = Array.isArray(keywordResults?.items)
    ? keywordResults.items.filter((item) => item.matched).map((item) => item.keyword)
    : [];
  const missingItems = Array.isArray(keywordResults?.items)
    ? keywordResults.items.filter((item) => !item.matched).map((item) => item.keyword)
    : [];
  const usedPowerWords = (powerWords ?? []).filter((word) =>
    normalizedResponse.includes(String(word).toLowerCase()),
  );
  const hasBarrier = /barrier|access|need|challenge|struggle|difficulty/.test(normalizedResponse);
  const hasEvidence = /data|evidence|monitor|observe|assessment|measure/.test(normalizedResponse);
  const hasImpact = /impact|outcome|result|progress|success|independence/.test(normalizedResponse);
  const hasSdi = /sdi|accommodation|modification|support|intervention|specialized/.test(normalizedResponse);

  return {
    responseText,
    wordCount: responseText.trim() ? responseText.trim().split(/\s+/).length : 0,
    keywordSummary: {
      matched: matchedItems,
      missing: missingItems,
    },
    writingCheck: {
      barrier: hasBarrier,
      evidence: hasEvidence,
      impact: hasImpact,
      sdi: hasSdi,
      powerWordsUsed: usedPowerWords,
    },
    scoreEstimate: scoreEstimate
      ? {
          value: scoreEstimate.estimatedScore,
          max: scoreEstimate.maxRubricScore,
          label:
            scoreEstimate.performanceLabel ||
            `${scoreEstimate.estimatedScore}/${scoreEstimate.maxRubricScore}`,
        }
      : undefined,
    rubricBreakdown: Array.isArray(rubricResults)
      ? rubricResults.map((item) => ({
          criterion: `Score ${item.score}`,
          notes: item.description,
        }))
      : [],
  };
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
      setResponseText(payload.userResponse ?? submissionText);
      setSubmitted(true);
      setShowFeedback(true);
    } catch (error) {
      submitStartedRef.current = false;
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const trainerPrompt = useMemo(
    () => buildTrainerPrompt(session, feedbackData),
    [session, feedbackData],
  );

  const trainerFeedback = useMemo(
    () =>
      buildFeedbackModel({
        responseText: feedbackData?.userResponse ?? responseText,
        keywordResults,
        rubricResults,
        scoreEstimate,
        powerWords: trainerPrompt?.powerWords ?? [],
      }),
    [feedbackData, keywordResults, rubricResults, responseText, scoreEstimate, trainerPrompt],
  );

  const saveStatus = submitted
    ? `Saved ${formatTimestamp(lastSavedAt)}`
    : `Saved ${formatTimestamp(lastSavedAt)}`;

  const topBar = (
    <TopBar
      title="NBCT Component 1"
      sectionTitle="Written Response Practice"
      centerContent={
        <div className="text-[12px] text-slate-600">
          Domain: {trainerPrompt?.domain ?? "--"}
        </div>
      }
      rightContent={
        <>
          {!submitted ? (
            <>
              <div className="border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700">
                Time {formatTime(secondsRemaining)}
              </div>
              <div className="border border-slate-300 px-3 py-1.5 text-[12px] text-slate-700">
                {saveStatus}
              </div>
            </>
          ) : (
            <div className="border border-slate-300 px-3 py-1.5 text-[12px] font-semibold text-slate-700">
              {saveStatus}
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

  if (!trainerPrompt) {
    return null;
  }

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
            !submitted ? (
              <>
                <button
                  type="button"
                  onClick={() => saveDraft(responseText)}
                  className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => submitResponse(responseText)}
                  disabled={isSubmitting}
                  className="border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit Response"}
                </button>
              </>
            ) : null
          }
        />
      }
    >
      <WritingPromptTrainer
        prompt={trainerPrompt}
        responseText={responseText}
        onResponseChange={setResponseText}
        onRewriteResponse={loadPrompt}
        onNextPrompt={loadPrompt}
        feedback={submitted && showFeedback ? trainerFeedback : null}
        secondsRemaining={submitted ? null : secondsRemaining}
        saveStatus={saveStatus}
        submitted={submitted && showFeedback}
        isSubmitting={isSubmitting}
      />
    </ExamShell>
  );
}

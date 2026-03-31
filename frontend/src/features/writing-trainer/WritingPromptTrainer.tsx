import { useMemo } from "react";
import type {
  WritingPromptRecord,
  WritingSubmissionFeedback,
} from "./types";
import { countWords } from "./validation";
import { IdealAnswerCard } from "./components/IdealAnswerCard";
import { PromptSupports } from "./components/PromptSupports";
import { ResponseEditor } from "./components/ResponseEditor";
import { SubmissionFeedback } from "./components/SubmissionFeedback";

type WritingPromptTrainerProps = {
  prompt: WritingPromptRecord;
  responseText: string;
  onResponseChange: (value: string) => void;
  onRewriteResponse?: () => void;
  onNextPrompt?: () => void;
  feedback?: WritingSubmissionFeedback | null;
  secondsRemaining?: number | null;
  saveStatus?: string | null;
  submitted?: boolean;
  isSubmitting?: boolean;
};

export function WritingPromptTrainer({
  prompt,
  responseText,
  onResponseChange,
  onRewriteResponse,
  onNextPrompt,
  feedback = null,
  secondsRemaining = null,
  saveStatus = null,
  submitted = false,
  isSubmitting = false,
}: WritingPromptTrainerProps) {
  const wordCount = useMemo(() => countWords(responseText), [responseText]);
  const requiredElements = Array.isArray(prompt.supports)
    ? prompt.supports.map((item) => item.content)
    : [];

  return (
    <section className="w-full max-w-none">
      <div className="grid w-full items-start gap-5 lg:grid-cols-[minmax(360px,42%)_minmax(620px,58%)] xl:grid-cols-[minmax(380px,40%)_minmax(700px,60%)]">
        <div className="min-w-0 space-y-4">
          <PromptSupports
            heading={prompt.title}
            scenario={prompt.scenario || prompt.promptText}
            task={prompt.task || ""}
            logic={prompt.logic || ""}
          />
        </div>

        <div className="min-w-0 space-y-4 border-l border-slate-200 pl-5">
          {submitted ? (
            <>
              <ResponseEditor
                value={responseText}
                onChange={onResponseChange}
                wordCount={wordCount}
                readOnly
              />
              {feedback ? <SubmissionFeedback feedback={feedback} /> : null}
              <IdealAnswerCard idealAnswer={prompt.idealAnswer || ""} />
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={onRewriteResponse}
                  className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
                >
                  Rewrite Response
                </button>
                <button
                  type="button"
                  onClick={onNextPrompt}
                  className="border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white"
                >
                  Next Prompt
                </button>
              </div>
            </>
          ) : (
            <ResponseEditor
              value={responseText}
              onChange={onResponseChange}
              wordCount={wordCount}
              powerWords={prompt.powerWords || []}
              sentenceStarter={prompt.sentenceStarter || ""}
              requiredElements={requiredElements}
              readOnly={submitted}
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default WritingPromptTrainer;

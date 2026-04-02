import { useMemo, useState } from "react";
import BottomControlBar from "../../components/BottomControlBar";
import ChoiceList from "../../components/ChoiceList";
import ExamShell from "../../components/ExamShell";
import TopBar from "../../components/TopBar";
import {
  getRenalFlashcards,
  getRenalFullDataset,
  getRenalGeneratedQuestionBank,
  getRenalHighYieldRuleSections,
  getRenalStudyGuideSections,
  getRenalTopics,
  getRenalTrapRecognitionRows,
} from "./data";

const TAB_OPTIONS = [
  { id: "browse", label: "Browse Questions" },
  { id: "generated", label: "Generated Bank" },
  { id: "rules", label: "High-Yield Rules" },
  { id: "traps", label: "Trap Recognition" },
  { id: "guide", label: "Study Guide" },
  { id: "flashcards", label: "Flashcards" },
];

const PROGRESS_STORAGE_KEY = "renal-module-progress";

function getStoredProgress() {
  try {
    return JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function setStoredProgress(progress) {
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function MarkdownBullet({ text }) {
  const [strongText, ...rest] = text.split(" — ");

  return (
    <li className="border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] leading-6 text-slate-700">
      {rest.length ? (
        <>
          <span className="font-semibold text-slate-900">{strongText}</span>
          <span>{` — ${rest.join(" — ")}`}</span>
        </>
      ) : (
        text
      )}
    </li>
  );
}

function MarkdownSections({ sections }) {
  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section key={section.title} className="border border-slate-300 bg-white">
          <header className="border-b border-slate-300 bg-slate-50 px-4 py-3">
            <h2 className="text-[18px] font-bold text-slate-900">{section.title}</h2>
          </header>
          <div className="space-y-5 px-4 py-4">
            {section.paragraphs.map((paragraph, index) => (
              <p key={`${section.title}-p-${index}`} className="text-[14px] leading-7 text-slate-700">
                {paragraph}
              </p>
            ))}

            {section.bullets.length ? (
              <ul className="space-y-2">
                {section.bullets.map((bullet, index) => (
                  <MarkdownBullet key={`${section.title}-b-${index}`} text={bullet} />
                ))}
              </ul>
            ) : null}

            {section.subsections.map((subsection) => (
              <div key={subsection.title} className="space-y-3 border-t border-slate-200 pt-4">
                <h3 className="text-[16px] font-semibold text-slate-900">{subsection.title}</h3>
                {subsection.paragraphs.map((paragraph, index) => (
                  <p
                    key={`${subsection.title}-p-${index}`}
                    className="text-[14px] leading-7 text-slate-700"
                  >
                    {paragraph}
                  </p>
                ))}
                {subsection.bullets.length ? (
                  <ul className="space-y-2">
                    {subsection.bullets.map((bullet, index) => (
                      <MarkdownBullet key={`${subsection.title}-b-${index}`} text={bullet} />
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function selectOptions(options, currentValue, onChange, idPrefix) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500" htmlFor={idPrefix}>
        Topic
      </label>
      <select
        id={idPrefix}
        value={currentValue}
        onChange={(event) => onChange(event.target.value)}
        className="border border-slate-300 bg-white px-3 py-2 text-[14px] text-slate-700"
      >
        <option value="all">All Topics</option>
        {options.map((topic) => (
          <option key={topic} value={topic}>
            {topic}
          </option>
        ))}
      </select>
    </div>
  );
}

function FullQuestionBrowser({
  topics,
  items,
  topicFilter,
  onTopicFilterChange,
  currentIndex,
  onCurrentIndexChange,
  selectedChoiceId,
  onSelectChoice,
  showAnswer,
  onToggleAnswer,
}) {
  const currentItem = items[currentIndex] ?? null;

  if (!currentItem) {
    return (
      <div className="border border-slate-300 bg-white p-6 text-[14px] text-slate-700">
        No renal questions match this topic filter.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="border border-slate-300 bg-white px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {selectOptions(topics, topicFilter, onTopicFilterChange, "renal-topic-filter")}
          <p className="text-[13px] text-slate-600">
            Question {currentIndex + 1} of {items.length}
          </p>
        </div>
      </section>

      <section className="border border-slate-300 bg-white">
        <header className="border-b border-slate-300 bg-slate-50 px-4 py-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {currentItem.topic}
          </p>
          <h2 className="mt-1 text-[20px] font-bold leading-8 text-slate-900">
            {currentItem.prompt}
          </h2>
        </header>

        <div className="space-y-5 px-4 py-4">
          <ChoiceList
            choices={currentItem.choices}
            selectedAnswer={selectedChoiceId}
            onSelectChoice={onSelectChoice}
            disabled={false}
            getOptionVariant={(choice) => {
              if (showAnswer) {
                if (choice.id === currentItem.answerLetter) {
                  return "correct";
                }

                if (choice.id === selectedChoiceId && choice.id !== currentItem.answerLetter) {
                  return "incorrect";
                }

                return "neutral";
              }

              return selectedChoiceId === choice.id ? "selected" : "neutral";
            }}
          />

          {showAnswer ? (
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div className="border border-emerald-300 bg-emerald-50 px-4 py-3">
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-emerald-800">
                  Correct Answer
                </p>
                <p className="mt-1 text-[15px] text-emerald-900">
                  {currentItem.answerLetter}. {currentItem.answerText}
                </p>
              </div>
              <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[13px] font-semibold text-slate-900">Bottom Line</p>
                <p className="mt-1 text-[14px] leading-7 text-slate-700">
                  {currentItem.bottomLine}
                </p>
              </div>
              <div className="border border-slate-200 bg-white px-4 py-3">
                <p className="text-[13px] font-semibold text-slate-900">Explanation</p>
                <p className="mt-1 text-[14px] leading-7 text-slate-700">
                  {currentItem.explanation}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onCurrentIndexChange((index) => Math.max(index - 1, 0))}
          disabled={currentIndex === 0}
          className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700 disabled:opacity-40"
        >
          Previous
        </button>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggleAnswer}
            className="border border-slate-300 px-4 py-2 text-[13px] font-semibold text-slate-700"
          >
            {showAnswer ? "Hide Answer" : "Reveal Answer"}
          </button>
          <button
            type="button"
            onClick={() =>
              onCurrentIndexChange((index) => Math.min(index + 1, items.length - 1))
            }
            disabled={currentIndex === items.length - 1}
            className="border border-slate-900 bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function GeneratedQuestionBankView({
  topics,
  items,
  topicFilter,
  onTopicFilterChange,
}) {
  return (
    <div className="space-y-4">
      <section className="border border-slate-300 bg-white px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {selectOptions(topics, topicFilter, onTopicFilterChange, "renal-generated-topic-filter")}
          <p className="text-[13px] text-slate-600">{items.length} generated prompts</p>
        </div>
      </section>

      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="border border-slate-300 bg-white">
            <header className="border-b border-slate-300 bg-slate-50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {item.topic}
                </p>
                <span className="border border-slate-300 bg-white px-2 py-1 text-[12px] font-semibold text-slate-700">
                  {item.type === "mcq" ? "MCQ" : "Recall"}
                </span>
              </div>
              <h2 className="mt-2 text-[18px] font-bold leading-7 text-slate-900">
                {item.prompt}
              </h2>
            </header>
            <div className="space-y-4 px-4 py-4">
              {item.type === "mcq" ? (
                <ul className="space-y-2">
                  {item.choices.map((choice) => (
                    <li
                      key={choice}
                      className={`border px-4 py-3 text-[14px] ${
                        choice === item.correct_answer
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {choice}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[13px] font-semibold text-slate-900">Answer</p>
                  <p className="mt-1 text-[14px] text-slate-700">{item.answer}</p>
                </div>
              )}
              <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="border border-slate-200 bg-white px-4 py-3">
                  <p className="text-[13px] font-semibold text-slate-900">Teaching Point</p>
                  <p className="mt-1 text-[14px] leading-7 text-slate-700">
                    {item.teaching_point || item.explanation}
                  </p>
                </div>
                {item.trap_to_avoid ? (
                  <div className="border border-amber-300 bg-amber-50 px-4 py-3">
                    <p className="text-[13px] font-semibold text-amber-900">Trap to Avoid</p>
                    <p className="mt-1 text-[14px] leading-7 text-amber-900">
                      {item.trap_to_avoid}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function TrapRecognitionView({ topics, items, topicFilter, onTopicFilterChange }) {
  return (
    <div className="space-y-4">
      <section className="border border-slate-300 bg-white px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {selectOptions(topics, topicFilter, onTopicFilterChange, "renal-trap-topic-filter")}
          <p className="text-[13px] text-slate-600">{items.length} trap patterns</p>
        </div>
      </section>

      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="border border-slate-300 bg-white">
            <header className="border-b border-slate-300 bg-slate-50 px-4 py-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {item.topic}
              </p>
              <h2 className="mt-2 text-[18px] font-bold leading-7 text-slate-900">
                {item.look_for}
              </h2>
            </header>
            <div className="grid gap-3 px-4 py-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[13px] font-semibold text-slate-900">Think</p>
                <p className="mt-1 text-[14px] leading-7 text-slate-700">{item.think}</p>
              </div>
              <div className="border border-slate-200 bg-white px-4 py-3">
                <p className="text-[13px] font-semibold text-slate-900">Why It Matters</p>
                <p className="mt-1 text-[14px] leading-7 text-slate-700">{item.why_it_matters}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function FlashcardsView({ topics, items, topicFilter, onTopicFilterChange, activeCardId, onFlipCard }) {
  return (
    <div className="space-y-4">
      <section className="border border-slate-300 bg-white px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {selectOptions(topics, topicFilter, onTopicFilterChange, "renal-flashcard-topic-filter")}
          <p className="text-[13px] text-slate-600">{items.length} flashcards</p>
        </div>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onFlipCard(item.id)}
            className="border border-slate-300 bg-white px-4 py-4 text-left"
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {item.deck.replace("renal::", "").replaceAll("_", " ")}
            </p>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-slate-900">
              {item.front}
            </p>
            {activeCardId === item.id ? (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-[13px] font-semibold text-slate-900">Back</p>
                <p className="mt-1 whitespace-pre-line text-[14px] leading-7 text-slate-700">
                  {item.back}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-[13px] font-semibold text-slate-600">Click to reveal</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RenalModule({ onBack }) {
  const [activeTab, setActiveTab] = useState("browse");
  const [questionTopicFilter, setQuestionTopicFilter] = useState("all");
  const [generatedTopicFilter, setGeneratedTopicFilter] = useState("all");
  const [trapTopicFilter, setTrapTopicFilter] = useState("all");
  const [flashcardTopicFilter, setFlashcardTopicFilter] = useState("all");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState(() => getStoredProgress().selectedChoices ?? {});
  const [revealedAnswers, setRevealedAnswers] = useState(() => getStoredProgress().revealedAnswers ?? {});
  const [activeFlashcardId, setActiveFlashcardId] = useState(null);

  const fullDataset = useMemo(() => getRenalFullDataset(), []);
  const generatedQuestionBank = useMemo(() => getRenalGeneratedQuestionBank(), []);
  const trapRecognitionRows = useMemo(() => getRenalTrapRecognitionRows(), []);
  const studyGuideSections = useMemo(() => getRenalStudyGuideSections(), []);
  const highYieldRuleSections = useMemo(() => getRenalHighYieldRuleSections(), []);
  const flashcards = useMemo(() => getRenalFlashcards(), []);
  const topics = useMemo(() => getRenalTopics(), []);

  const filteredQuestions = useMemo(() => {
    const items =
      questionTopicFilter === "all"
        ? fullDataset
        : fullDataset.filter((item) => item.topic === questionTopicFilter);

    return items;
  }, [fullDataset, questionTopicFilter]);

  const filteredGeneratedQuestions = useMemo(
    () =>
      generatedTopicFilter === "all"
        ? generatedQuestionBank
        : generatedQuestionBank.filter((item) => item.topic === generatedTopicFilter),
    [generatedQuestionBank, generatedTopicFilter],
  );

  const filteredTrapRows = useMemo(
    () =>
      trapTopicFilter === "all"
        ? trapRecognitionRows
        : trapRecognitionRows.filter((item) => item.topic === trapTopicFilter),
    [trapRecognitionRows, trapTopicFilter],
  );

  const filteredFlashcards = useMemo(
    () =>
      flashcardTopicFilter === "all"
        ? flashcards
        : flashcards.filter((item) =>
            item.deck.toLowerCase().includes(
              flashcardTopicFilter.toLowerCase().replaceAll(" ", "_"),
            ),
          ),
    [flashcards, flashcardTopicFilter],
  );

  const safeQuestionIndex = Math.min(
    currentQuestionIndex,
    Math.max(filteredQuestions.length - 1, 0),
  );
  const selectedQuestion = filteredQuestions[safeQuestionIndex] ?? null;
  const progressSummary = {
    answered: Object.keys(selectedChoices).length,
    revealed: Object.keys(revealedAnswers).length,
    fullDataset: fullDataset.length,
    generated: generatedQuestionBank.length,
  };

  function updateProgress(nextSelectedChoices, nextRevealedAnswers) {
    setStoredProgress({
      selectedChoices: nextSelectedChoices,
      revealedAnswers: nextRevealedAnswers,
    });
  }

  function handleSelectChoice(choiceId) {
    if (!selectedQuestion) {
      return;
    }

    const nextSelectedChoices = {
      ...selectedChoices,
      [selectedQuestion.id]: choiceId,
    };

    setSelectedChoices(nextSelectedChoices);
    updateProgress(nextSelectedChoices, revealedAnswers);
  }

  function handleToggleAnswer() {
    if (!selectedQuestion) {
      return;
    }

    const nextRevealedAnswers = {
      ...revealedAnswers,
      [selectedQuestion.id]: !revealedAnswers[selectedQuestion.id],
    };

    setRevealedAnswers(nextRevealedAnswers);
    updateProgress(selectedChoices, nextRevealedAnswers);
  }

  function handleQuestionTopicChange(nextTopic) {
    setQuestionTopicFilter(nextTopic);
    setCurrentQuestionIndex(0);
  }

  const topBar = (
    <TopBar
      title="NBCT Component 1"
      sectionTitle="Renal Module"
      centerContent={
        <div className="text-[12px] text-slate-600">
          {progressSummary.fullDataset} source questions | {progressSummary.generated} generated cards
        </div>
      }
      rightContent={
        <div className="border border-slate-300 px-3 py-1.5 text-[12px] text-slate-700">
          {progressSummary.answered} answered | {progressSummary.revealed} revealed
        </div>
      }
    />
  );

  let content = null;

  if (activeTab === "browse") {
    content = (
      <FullQuestionBrowser
        topics={topics}
        items={filteredQuestions}
        topicFilter={questionTopicFilter}
        onTopicFilterChange={handleQuestionTopicChange}
        currentIndex={safeQuestionIndex}
        onCurrentIndexChange={setCurrentQuestionIndex}
        selectedChoiceId={selectedQuestion ? selectedChoices[selectedQuestion.id] ?? null : null}
        onSelectChoice={handleSelectChoice}
        showAnswer={selectedQuestion ? Boolean(revealedAnswers[selectedQuestion.id]) : false}
        onToggleAnswer={handleToggleAnswer}
      />
    );
  } else if (activeTab === "generated") {
    content = (
      <GeneratedQuestionBankView
        topics={topics}
        items={filteredGeneratedQuestions}
        topicFilter={generatedTopicFilter}
        onTopicFilterChange={setGeneratedTopicFilter}
      />
    );
  } else if (activeTab === "rules") {
    content = <MarkdownSections sections={highYieldRuleSections} />;
  } else if (activeTab === "traps") {
    content = (
      <TrapRecognitionView
        topics={topics}
        items={filteredTrapRows}
        topicFilter={trapTopicFilter}
        onTopicFilterChange={setTrapTopicFilter}
      />
    );
  } else if (activeTab === "guide") {
    content = <MarkdownSections sections={studyGuideSections} />;
  } else {
    content = (
      <FlashcardsView
        topics={topics}
        items={filteredFlashcards}
        topicFilter={flashcardTopicFilter}
        onTopicFilterChange={setFlashcardTopicFilter}
        activeCardId={activeFlashcardId}
        onFlipCard={(cardId) =>
          setActiveFlashcardId((current) => (current === cardId ? null : cardId))
        }
      />
    );
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
          rightContent={null}
        />
      }
    >
      <div className="space-y-4">
        <section className="border border-slate-300 bg-white px-5 py-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Renal
          </p>
          <h1 className="mt-2 text-[28px] font-bold text-slate-900">
            Study renal questions, rules, traps, and guide content in one module.
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-700">
            This module uses the local renal source files in the repo as its source of truth,
            including the full dataset, generated question bank, trap-recognition table,
            flashcard import, and markdown study materials.
          </p>
        </section>

        <section className="flex flex-wrap gap-2">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border px-4 py-2 text-[13px] font-semibold ${
                activeTab === tab.id
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {content}
      </div>
    </ExamShell>
  );
}

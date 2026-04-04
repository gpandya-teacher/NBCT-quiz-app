export default function ExportPanel({ result }) {
  if (!result) return null;

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }

  function copyRepairPrompt() {
    const failedIds = result.errors.map((e) => e.qid).join(", ");

    const prompt = `
Repair the following dataset questions.

Failed Questions: ${failedIds}

Rules:
- Remove "Choice A:" leakage
- Options must be clean
- explanation must contain full reasoning
- bottom_line must be concise (1–2 sentences)
- preserve qid and answer_letter
`;

    navigator.clipboard.writeText(prompt);
    alert("Repair prompt copied!");
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Export Tools</h3>

      <button onClick={() => downloadJSON(result.errors, "error_report.json")}>
        Download Error Report
      </button>

      <button
        onClick={() =>
          downloadJSON(result.failedQuestions, "failed_questions.json")
        }
      >
        Download Failed Questions
      </button>

      <button onClick={copyRepairPrompt}>
        Copy Repair Prompt
      </button>
    </div>
  );
}
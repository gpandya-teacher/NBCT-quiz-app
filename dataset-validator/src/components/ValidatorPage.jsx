import { useState } from "react";
import { validateDataset } from "../utils/validateDataset";
import ExportPanel from "./ExportPanel";

export default function ValidatorPage() {
  const [result, setResult] = useState(null);

  function handleFile(e) {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const res = validateDataset(data);
        setResult(res);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };

    reader.readAsText(file);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Dataset Validator</h1>

      <input type="file" accept=".json" onChange={handleFile} />

      {result && (
        <>
          <h3>
            Total: {result.total} | Failed: {result.failed}
          </h3>

          {result.errors.map((q) => (
            <div key={q.qid} style={{ marginBottom: 12 }}>
              <strong>Q{q.qid}</strong>
              <ul>
                {q.errors.map((e, i) => (
                  <li key={i}>
                    {e.field}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <ExportPanel result={result} />
        </>
      )}
    </div>
  );
}
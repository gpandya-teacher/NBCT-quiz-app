export function validateDataset(data) {
  const errors = [];
  const failedQuestions = [];

  data.forEach((q, index) => {
    const qNum = q.qid || index + 1;
    const qErrors = [];

    Object.entries(q.options || {}).forEach(([key, val]) => {
      if (!val || val.length > 300) {
        qErrors.push({
          field: `options.${key}`,
          type: "invalid_option",
          message: "Option too long or empty",
        });
      }

      if (/Choice [A-E]:/i.test(val)) {
        qErrors.push({
          field: `options.${key}`,
          type: "leakage",
          message: "Contains 'Choice X:'",
        });
      }
    });

    if (!q.options?.[q.answer_letter]) {
      qErrors.push({
        field: "answer_letter",
        type: "invalid_answer",
        message: "Not found in options",
      });
    }

    if (!q.answer_text) {
      qErrors.push({
        field: "answer_text",
        type: "missing",
        message: "Missing answer_text",
      });
    }

    if (!q.bottom_line || q.bottom_line.length > 200) {
      qErrors.push({
        field: "bottom_line",
        type: "too_long",
        message: "Too long or missing",
      });
    }

    if (/Choice [A-E]:/i.test(q.explanation || "")) {
      qErrors.push({
        field: "explanation",
        type: "leakage",
        message: "Contains 'Choice X:'",
      });
    }

    if (qErrors.length > 0) {
      errors.push({
        qid: qNum,
        errors: qErrors,
      });

      failedQuestions.push(q);
    }
  });

  return {
    total: data.length,
    failed: errors.length,
    errors,
    failedQuestions,
  };
}
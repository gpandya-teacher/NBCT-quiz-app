export function parseDelimitedText(input, delimiter = ",") {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const nextCharacter = input[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && character === delimiter) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if (!inQuotes && (character === "\n" || character === "\r")) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      currentRow.push(currentValue);
      if (currentRow.some((value) => value.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  currentRow.push(currentValue);
  if (currentRow.some((value) => value.length > 0)) {
    rows.push(currentRow);
  }

  if (!rows.length) {
    return [];
  }

  const [headerRow, ...valueRows] = rows;
  const headers = headerRow.map((item) => item.trim());

  return valueRows.map((row) =>
    headers.reduce((record, header, index) => {
      record[header] = (row[index] ?? "").trim();
      return record;
    }, {}),
  );
}

export function parseMarkdownSections(markdownText) {
  const lines = String(markdownText ?? "").split(/\r?\n/);
  const sections = [];
  let currentSection = null;
  let currentSubsection = null;

  function ensureSection(title) {
    currentSection = {
      title,
      paragraphs: [],
      bullets: [],
      subsections: [],
    };
    sections.push(currentSection);
    currentSubsection = null;
  }

  function ensureSubsection(title) {
    if (!currentSection) {
      ensureSection("Overview");
    }

    currentSubsection = {
      title,
      paragraphs: [],
      bullets: [],
    };
    currentSection.subsections.push(currentSubsection);
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith("# ")) {
      ensureSection(trimmed.replace(/^#\s+/, ""));
      continue;
    }

    if (trimmed.startsWith("## ")) {
      ensureSubsection(trimmed.replace(/^##\s+/, ""));
      continue;
    }

    if (trimmed.startsWith("- ")) {
      if (!currentSection) {
        ensureSection("Overview");
      }

      (currentSubsection ?? currentSection).bullets.push(trimmed.replace(/^-+\s*/, ""));
      continue;
    }

    if (!currentSection) {
      ensureSection("Overview");
    }

    (currentSubsection ?? currentSection).paragraphs.push(trimmed);
  }

  return sections;
}

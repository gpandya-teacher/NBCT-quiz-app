const DATASET_MAP = {
  MSK: '/data/MSK_full_dataset.json',
  Pharma: '/data/Pharma_full_dataset.json',
  Neuro: '/data/Neuro_full_dataset.json'
};

export async function loadDataset(subject) {
  const path = DATASET_MAP[subject];

  if (!path) {
    throw new Error(`No dataset configured for subject: ${subject}`);
  }

  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Failed to load dataset from ${path}`);
  }

  const raw = await res.json();

  if (!Array.isArray(raw)) {
    throw new Error(`Dataset at ${path} is not an array`);
  }

  return raw.map((q, index) => normalizeQuestion(q, subject, index));
}

function normalizeQuestion(q, fallbackSubject, index) {
  const rawOptions = q.options && typeof q.options === 'object' ? q.options : {};

  const normalizedOptions = Object.entries(rawOptions)
    .filter(([key, value]) => typeof value === 'string' && value.trim() !== '')
    .map(([key, value]) => ({
      key: String(key).trim().toUpperCase(),
      text: value.trim()
    }));

  const answerLetter = String(q.answer_letter || '')
    .trim()
    .toUpperCase();

  const matchedOption = normalizedOptions.find(
    (opt) => opt.key === answerLetter
  );

  const answerText =
    (typeof q.answer_text === 'string' && q.answer_text.trim()) ||
    (matchedOption ? matchedOption.text : '');

  return {
    id: q.qid ?? index + 1,
    originalId: q.original_id ?? '',
    subject: q.subject || fallbackSubject || '',
    topic: q.topic || '',
    stem: q.stem || '',
    options: normalizedOptions,
    correctAnswer: answerLetter,
    correctText: answerText,
    explanation: typeof q.explanation === 'string' ? q.explanation.trim() : '',
    bottomLine: typeof q.bottom_line === 'string' ? q.bottom_line.trim() : '',
    questionImages: Array.isArray(q.question_images) ? q.question_images : []
  };
}
import fullDataset from "../../data/neuro/neuro_full_dataset.json";
import generatedQuestionBank from "../../data/neuro/neuro_generated_question_bank.json";
import trapRecognitionRaw from "../../data/neuro/neuro_trap_recognition.csv?raw";
import ankiImportRaw from "../../data/neuro/neuro_anki_import.tsv?raw";
import studyGuideRaw from "../../data/neuro/neuro_study_guide.md?raw";
import highYieldRulesRaw from "../../data/neuro/neuro_high_yield_rules.md?raw";
import manifestEntries from "../../data/neuro/manifest.json";
import { createSubjectData } from "../subjects/createSubjectData";

const neuroImageMap = import.meta.glob("../../data/neuro/images/*", {
  eager: true,
  import: "default",
});

export const neuroModuleData = createSubjectData({
  subjectId: "neuro",
  subjectTitle: "Neuro",
  fullDataset,
  generatedQuestionBank,
  ankiImportRaw,
  studyGuideRaw,
  highYieldRulesRaw,
  trapRecognitionRaw,
  manifestEntries,
  imageMap: Object.fromEntries(
    Object.entries(neuroImageMap).map(([filePath, url]) => {
      const fileName = filePath.split("/").pop();
      return [`images/${fileName}`, url];
    }),
  ),
});

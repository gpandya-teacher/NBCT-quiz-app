import fullDataset from "../../data/renal/renal_full_dataset.json";
import generatedQuestionBank from "../../data/renal/renal_generated_question_bank.json";
import trapRecognitionRaw from "../../data/renal/renal_trap_recognition.csv?raw";
import ankiImportRaw from "../../data/renal/renal_anki_import.tsv?raw";
import studyGuideRaw from "../../data/renal/renal_study_guide.md?raw";
import highYieldRulesRaw from "../../data/renal/renal_high_yield_rules.md?raw";
import manifestEntries from "../../data/renal/manifest.json";
import { createSubjectData } from "../subjects/createSubjectData";

const renalImageMap = import.meta.glob("../../data/renal/images/*", {
  eager: true,
  import: "default",
});

export const renalModuleData = createSubjectData({
  subjectId: "renal",
  subjectTitle: "Renal",
  fullDataset,
  generatedQuestionBank,
  ankiImportRaw,
  studyGuideRaw,
  highYieldRulesRaw,
  trapRecognitionRaw,
  manifestEntries,
  imageMap: Object.fromEntries(
    Object.entries(renalImageMap).map(([filePath, url]) => {
      const fileName = filePath.split("/").pop();
      return [`images/${fileName}`, url];
    }),
  ),
});

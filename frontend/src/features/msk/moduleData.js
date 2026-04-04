import fullDataset from "../../data/msk/msk_full_dataset.json";
import generatedQuestionBank from "../../data/msk/msk_generated_question_bank.json";
import trapRecognitionRaw from "../../data/msk/msk_trap_recognition.csv?raw";
import ankiImportRaw from "../../data/msk/msk_anki_import.tsv?raw";
import studyGuideRaw from "../../data/msk/msk_study_guide.md?raw";
import highYieldRulesRaw from "../../data/msk/msk_high_yield_rules.md?raw";
import manifestEntries from "../../data/msk/manifest.json";
import { createSubjectData } from "../subjects/createSubjectData";

const mskImageMap = import.meta.glob("../../data/msk/images/*", {
  eager: true,
  import: "default",
});

export const mskModuleData = createSubjectData({
  subjectId: "msk",
  subjectTitle: "MSK",
  fullDataset,
  generatedQuestionBank,
  ankiImportRaw,
  studyGuideRaw,
  highYieldRulesRaw,
  trapRecognitionRaw,
  manifestEntries,
  imageMap: Object.fromEntries(
    Object.entries(mskImageMap).map(([filePath, url]) => {
      const fileName = filePath.split("/").pop();
      return [`images/${fileName}`, url];
    }),
  ),
});

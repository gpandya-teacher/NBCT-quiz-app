import fullDataset from "../../data/pharma/pharma_full_dataset.json";
import generatedQuestionBank from "../../data/pharma/pharma_generated_question_bank.json";
import ankiImportRaw from "../../data/pharma/pharma_anki_import.tsv?raw";
import studyGuideRaw from "../../data/pharma/pharma_study_guide.md?raw";
import highYieldRulesRaw from "../../data/pharma/pharma_high_yield_rules.md?raw";
import manifestEntries from "../../data/pharma/manifest.json";
import { createSubjectData } from "../subjects/createSubjectData";

const pharmaImageMap = import.meta.glob("../../data/pharma/images/*", {
  eager: true,
  import: "default",
});

export const pharmaModuleData = createSubjectData({
  subjectId: "pharma",
  subjectTitle: "Pharma",
  fullDataset,
  generatedQuestionBank,
  ankiImportRaw,
  studyGuideRaw,
  highYieldRulesRaw,
  trapRecognitionRaw: null,
  manifestEntries,
  imageMap: Object.fromEntries(
    Object.entries(pharmaImageMap).map(([filePath, url]) => {
      const fileName = filePath.split("/").pop();
      return [`images/${fileName}`, url];
    }),
  ),
});

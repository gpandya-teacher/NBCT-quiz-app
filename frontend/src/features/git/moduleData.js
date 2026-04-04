import fullDataset from "../../data/git/git_dataset.json";
import generatedQuestionBank from "../../data/git/git_generated_question_bank.json";
import trapRecognitionRaw from "../../data/git/git_trap_recognition.csv?raw";
import ankiImportRaw from "../../data/git/git_anki_import.tsv?raw";
import studyGuideRaw from "../../data/git/git_redeem.txt?raw";
import highYieldRulesRaw from "../../data/git/git_high_yield_rules.md?raw";
import { createSubjectData } from "../subjects/createSubjectData";

const gitImageMap = import.meta.glob("../../data/git/images/*", {
  eager: true,
  import: "default",
});

function buildGitImageMap() {
  return Object.fromEntries(
    Object.entries(gitImageMap).flatMap(([filePath, url]) => {
      const fileName = filePath.split("/").pop();

      return [
        [`images/${fileName}`, url],
        [`images/gastroenterology/${fileName}`, url],
      ];
    }),
  );
}

export const gitModuleData = createSubjectData({
  subjectId: "git",
  subjectTitle: "GIT",
  fullDataset,
  generatedQuestionBank,
  ankiImportRaw,
  studyGuideRaw,
  highYieldRulesRaw,
  trapRecognitionRaw,
  imageMap: buildGitImageMap(),
});

import SubjectModule from "../subjects/SubjectModule";
import { renalModuleData } from "./moduleData";

export default function RenalModule({ onBack }) {
  return <SubjectModule subject={{ id: "renal", title: "Renal", data: renalModuleData }} onBack={onBack} />;
}

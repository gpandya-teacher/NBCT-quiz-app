import SubjectModule from "../subjects/SubjectModule";
import { neuroModuleData } from "./moduleData";

export default function NeuroModule({ onBack }) {
  return <SubjectModule subject={{ id: "neuro", title: "Neuro", data: neuroModuleData }} onBack={onBack} />;
}

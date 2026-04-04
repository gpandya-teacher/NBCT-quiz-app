import SubjectModule from "../subjects/SubjectModule";
import { pharmaModuleData } from "./moduleData";

export default function PharmaModule({ onBack }) {
  return <SubjectModule subject={{ id: "pharma", title: "Pharma", data: pharmaModuleData }} onBack={onBack} />;
}

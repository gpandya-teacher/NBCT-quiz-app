import SubjectModule from "../subjects/SubjectModule";
import { mskModuleData } from "./moduleData";

export default function MSKModule({ onBack }) {
  return <SubjectModule subject={{ id: "msk", title: "MSK", data: mskModuleData }} onBack={onBack} />;
}

import SubjectModule from "../subjects/SubjectModule";
import { gitModuleData } from "./moduleData";

export default function GITModule({ onBack }) {
  return <SubjectModule subject={{ id: "git", title: "GIT", data: gitModuleData }} onBack={onBack} />;
}

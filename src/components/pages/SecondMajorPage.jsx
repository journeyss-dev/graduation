import RequirementPage from "../RequirementPage.jsx";
import SecondMajorPanel from "../SecondMajorPanel.jsx";

// 제2전공 이수 확인 화면. (직업교육 + 중등 2전공 복수전공에서 표시과목과 별도로 나오는 요건)
export default function SecondMajorPage({ requirement, state, onChange, onBack }) {
  return (
    <RequirementPage title={requirement.title} completed={requirement.completed} onBack={onBack}>
      <SecondMajorPanel state={state} onChange={onChange} />
    </RequirementPage>
  );
}

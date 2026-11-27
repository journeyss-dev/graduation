import RequirementPage from "../RequirementPage.jsx";
import { majorBasicRequiredCourse } from "../../rules/courses.js";

// 요건 4: 전공기초(9학점) 화면.
// 필수 과목 체크 + 사회과학 계열 / 사회과학 외 계열 이수 여부를 체크한다.
// 어떤 과목이 어느 계열인지는 학교 홈페이지에서 확인할 수 있다.
export default function MajorBasicPage({ requirement, state, onChange, onBack }) {
  const { requiredCourseChecked, slots } = requirement.detail;

  // 필수 과목 체크 상태를 바꾼다.
  function toggleRequiredCourse(checked) {
    onChange({ checkedCourses: { ...state.checkedCourses, [majorBasicRequiredCourse.code]: checked } });
  }

  // 계열별 이수 여부를 바꾼다. 계열마다 한 과목(3학점)이므로, 체크하면 필요 학점만큼 이수한 것으로 저장한다.
  function toggleSlot(slot, checked) {
    onChange({ majorBasicFreeCredits: { ...state.majorBasicFreeCredits, [slot.id]: checked ? slot.requiredCredits : 0 } });
  }

  return (
    <RequirementPage title={requirement.title} completed={requirement.completed} onBack={onBack}>
      <section className="card">
        <h2>필수 과목</h2>
        <label className="check-row">
          <input type="checkbox" checked={requiredCourseChecked} onChange={(e) => toggleRequiredCourse(e.target.checked)} />
          <span>{majorBasicRequiredCourse.name}</span>
          <span className="meta">{majorBasicRequiredCourse.credits}학점</span>
        </label>
      </section>

      <section className="card">
        <h2>계열별 이수 과목</h2>
        <p className="help">
          이수한 전공기초 과목이 어느 계열인지는 학교 홈페이지에서 확인할 수 있어요.
          계열마다 한 과목(3학점)씩 이수했다면 체크하세요.
        </p>

        {slots.map((slot) => (
          <label key={slot.id} className="check-row">
            <input type="checkbox" checked={slot.completed} onChange={(e) => toggleSlot(slot, e.target.checked)} />
            <span>{slot.label}에서 이수</span>
            <span className="meta">{slot.requiredCredits}학점</span>
          </label>
        ))}
      </section>
    </RequirementPage>
  );
}

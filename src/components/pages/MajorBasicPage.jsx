import RequirementPage from "../RequirementPage.jsx";
import { majorBasicRequiredCourse } from "../../rules/courses.js";

// 요건 4: 전공기초 화면.
// 필수 과목 + 사회과학계열 과목 + 사회과학 외 과목 이수 여부를 체크한다. (각 3학점)
// 복수전공이면 복수전공(제2전공)의 전공기초 과목 이수도 체크한다. (학점은 확인하지 않는다)
export default function MajorBasicPage({ requirement, state, onChange, onBack }) {
  const { requiredCourseChecked, slots, needsSecondMajorBasic } = requirement.detail;

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
            <span>{slot.label} 과목 이수완료</span>
            <span className="meta">{slot.requiredCredits}학점</span>
          </label>
        ))}
      </section>

      {needsSecondMajorBasic && (
        <section className="card">
          <h2>복수전공 전공기초</h2>
          <p className="help">복수전공을 하는 학생은 복수전공의 전공기초 과목도 이수해야 해요. 학점은 확인하지 않아도 됩니다.</p>
          <label className="check-row">
            <input
              type="checkbox"
              checked={state.secondMajorBasicDone}
              onChange={(e) => onChange({ secondMajorBasicDone: e.target.checked })}
            />
            <span>복수전공 전공기초 과목 이수완료</span>
          </label>
        </section>
      )}
    </RequirementPage>
  );
}

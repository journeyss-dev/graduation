import { useState } from "react";
import RequirementPage from "../RequirementPage.jsx";
import AllConfirmedCheck from "../AllConfirmedCheck.jsx";
import Icon from "../Icon.jsx";
import { CORE_COURSE_CREDITS } from "../../rules/liberalArts.js";

const MIN_CREDITS = 1;
const MAX_CREDITS = 9;

// 요건 3: 중핵교양 화면.
// 영역마다 최소 학점 이상 이수하고, 전체 합계도 총 학점 이상이어야 한다.
// 이수한 과목을 영역별로 직접 입력한다. (과목 목록은 학번·학기마다 달라 고정해 두지 않는다)
// 화면 순서: ① 모두 만족 체크 → ② 과목 추가(맨 위, 추가해도 화면이 아래로 밀리지 않게) → ③ 영역별 현황
export default function CoreLiberalPage({ requirement, state, onChange, onBack }) {
  const { areas, earnedCredits, requiredCredits } = requirement.detail;

  // 새 과목 입력 칸의 값
  const [newArea, setNewArea] = useState(areas[0]?.name ?? "");
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState(CORE_COURSE_CREDITS);

  // 입력한 과목을 목록에 추가한다.
  function addCourse() {
    const course = { area: newArea, name: newName.trim(), credits: newCredits };
    onChange({ coreLiberalCourses: [...state.coreLiberalCourses, course] });
    setNewName("");
  }

  // 입력한 과목을 목록에서 뺀다. (index는 state.coreLiberalCourses 안에서의 위치)
  function removeCourse(index) {
    onChange({ coreLiberalCourses: state.coreLiberalCourses.filter((_, i) => i !== index) });
  }

  // 학점 칸의 +/- 버튼. 1~9학점 범위를 벗어나지 않게 한다.
  function changeNewCredits(amount) {
    setNewCredits((current) => Math.min(MAX_CREDITS, Math.max(MIN_CREDITS, current + amount)));
  }

  // 학점이 영역 기준에 비해 남는 만큼 (아무 영역에서나 채울 수 있는 학점)
  const minCreditsSum = areas.reduce((sum, area) => sum + area.minCredits, 0);
  const freeCredits = requiredCredits - minCreditsSum;

  return (
    <RequirementPage title={requirement.title} completed={requirement.completed} onBack={onBack}>
      <AllConfirmedCheck
        label="중핵교양 요건을 모두 만족하였습니다."
        checked={state.coreLiberalAllConfirmed}
        onChange={(checked) => onChange({ coreLiberalAllConfirmed: checked })}
      />

      {/* ② 과목 추가: 맨 위에 두어서, 과목을 추가해도 입력 칸이 화면 아래로 밀려나지 않는다 */}
      <section className="card">
        <div className="section-head">
          <h2>이수한 과목 추가</h2>
          <span className="status-chip">{earnedCredits} / {requiredCredits}학점</span>
        </div>

        <div className="add-form">
          <div>
            <p className="field-label">영역</p>
            {/* 영역이 몇 개 안 되므로 목록 대신 버튼으로 고른다 */}
            <div className="chip-group">
              {areas.map((area) => (
                <label key={area.name} className={`chip ${newArea === area.name ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="core-area"
                    checked={newArea === area.name}
                    onChange={() => setNewArea(area.name)}
                  />
                  {area.name}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="field-label">과목명 <span className="meta">(선택)</span></p>
            <input
              className="input full"
              placeholder="예: 철학의 이해"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div className="add-form-row">
            <div>
              <p className="field-label">학점</p>
              <div className="stepper">
                <button type="button" aria-label="학점 줄이기" onClick={() => changeNewCredits(-1)} disabled={newCredits <= MIN_CREDITS}>
                  <Icon name="minus" />
                </button>
                <span>{newCredits}</span>
                <button type="button" aria-label="학점 늘리기" onClick={() => changeNewCredits(1)} disabled={newCredits >= MAX_CREDITS}>
                  <Icon name="plus" />
                </button>
              </div>
            </div>
            <button className="button primary add-button" onClick={addCourse}>
              <Icon name="plus" />
              추가
            </button>
          </div>
        </div>

        <p className="help">
          영역마다 최소 학점 이상 이수하고, 전체 {requiredCredits}학점을 채워야 해요.
          {freeCredits > 0 && ` 영역별 최소 학점 외에 남는 ${freeCredits}학점은 어느 영역에서든 채워도 됩니다.`}
        </p>
      </section>

      {/* ③ 영역별 현황 */}
      {areas.map((area) => (
        <section key={area.name} className="card">
          <div className="section-head">
            <h2>{area.name}</h2>
            <span className={`status ${area.completed ? "done" : "todo"}`}>
              {area.earned} / {area.minCredits}학점 이상
            </span>
          </div>

          <ul className="edit-list">
            {state.coreLiberalCourses.map((course, index) =>
              course.area === area.name ? (
                <li key={index} className="edit-row">
                  <span className="grow">{course.name || "(과목명 없음)"}</span>
                  <span className="meta">{course.credits}학점</span>
                  <button className="button small danger" onClick={() => removeCourse(index)}>삭제</button>
                </li>
              ) : null,
            )}
          </ul>
        </section>
      ))}
    </RequirementPage>
  );
}

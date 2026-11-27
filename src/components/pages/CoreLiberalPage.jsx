import { useState } from "react";
import RequirementPage from "../RequirementPage.jsx";
import AllConfirmedCheck from "../AllConfirmedCheck.jsx";
import { CORE_COURSE_CREDITS } from "../../rules/liberalArts.js";

// 요건 3: 중핵교양 화면.
// 영역마다 최소 학점 이상 이수하고, 전체 합계도 총 학점 이상이어야 한다.
// 이수한 과목을 영역별로 직접 입력한다. (과목 목록은 학번·학기마다 달라 고정해 두지 않는다)
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

      <section className="card">
        <p className="help">
          영역마다 최소 학점 이상 이수하고, 전체 {requiredCredits}학점을 채워야 해요.
          {freeCredits > 0 && ` 영역별 최소 학점 외에 남는 ${freeCredits}학점은 어느 영역에서든 채워도 됩니다.`}
        </p>
        <p className="result-line">{earnedCredits} / {requiredCredits}학점</p>
      </section>

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

      <section className="card">
        <h2>이수한 과목 추가</h2>
        <div className="form-grid">
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
          <input
            className="input"
            placeholder="과목명 (선택)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <label className="inline-field">
            <input
              className="input narrow"
              type="number"
              min="1"
              inputMode="numeric"
              value={newCredits}
              onChange={(e) => setNewCredits(Math.max(1, Number(e.target.value) || 1))}
            />
            <span className="meta">학점</span>
          </label>
        </div>
        <div className="button-row">
          <button className="button primary" onClick={addCourse}>추가</button>
        </div>
      </section>
    </RequirementPage>
  );
}

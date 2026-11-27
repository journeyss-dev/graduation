import { useState } from "react";
import RequirementPage from "../RequirementPage.jsx";
import { getBasicLiberalCourses } from "../../logic/liberalArts.js";

// 과목명을 입력하는 칸. 글자를 입력하는 동안에는 임시로 들고 있다가, 입력을 마치면(blur) 확정한다.
// 비어 있거나 이미 있는 이름이면 원래 이름으로 되돌린다. (체크 상태를 과목명으로 저장하기 때문)
function CourseNameInput({ name, onCommit }) {
  const [draft, setDraft] = useState(name);

  function commit() {
    const accepted = onCommit(draft.trim());
    if (!accepted) setDraft(name);
  }

  return (
    <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} />
  );
}

// 요건 2: 기초교양 화면.
// 입학년도별 필수 과목을 체크한다. 학번마다 과목 구성이 조금씩 달라서,
// "목록 수정"을 누르면 과목을 추가·삭제하고 이름·학점을 직접 고칠 수 있다.
export default function BasicLiberalPage({ requirement, state, onChange, onBack }) {
  const [isEditing, setIsEditing] = useState(false);

  const basicLiberal = state.basicLiberal;
  const courses = getBasicLiberalCourses(state);
  const isCustomized = basicLiberal.customCourses !== null;

  // 기초교양 입력을 한 번에 바꾼다.
  function updateBasicLiberal(patch) {
    onChange({ basicLiberal: { ...basicLiberal, ...patch } });
  }

  // 과목 체크 상태를 바꾼다.
  function toggleCourse(courseName, checked) {
    updateBasicLiberal({ checked: { ...basicLiberal.checked, [courseName]: checked } });
  }

  // ----- 목록 수정 -----

  // 목록 수정을 시작한다. 기본 목록을 복사해서 학생 목록으로 만든다.
  function startEditing() {
    if (!isCustomized) updateBasicLiberal({ customCourses: courses.map((course) => ({ ...course })) });
    setIsEditing(true);
  }

  // 과목 이름을 바꾼다. 체크 상태도 새 이름으로 옮긴다. 바꿀 수 없는 이름이면 false.
  function renameCourse(index, newName) {
    const oldName = courses[index].name;
    if (newName === oldName) return true;

    const isEmpty = newName === "";
    const isDuplicate = courses.some((course) => course.name === newName);
    if (isEmpty || isDuplicate) return false;

    const { [oldName]: wasChecked, ...restChecked } = basicLiberal.checked;
    updateBasicLiberal({
      customCourses: courses.map((course, i) => (i === index ? { ...course, name: newName } : course)),
      checked: wasChecked ? { ...restChecked, [newName]: true } : restChecked,
    });
    return true;
  }

  // 과목 학점을 바꾼다.
  function changeCredits(index, credits) {
    updateBasicLiberal({
      customCourses: courses.map((course, i) => (i === index ? { ...course, credits: Math.max(0, credits) } : course)),
    });
  }

  // 과목을 삭제한다.
  function removeCourse(index) {
    const { [courses[index].name]: removed, ...restChecked } = basicLiberal.checked;
    updateBasicLiberal({ customCourses: courses.filter((_, i) => i !== index), checked: restChecked });
  }

  // 새 과목을 추가한다. 이름이 겹치지 않도록 "새 과목", "새 과목 2" ... 순으로 붙인다.
  function addCourse() {
    let newName = "새 과목";
    for (let number = 2; courses.some((course) => course.name === newName); number++) {
      newName = `새 과목 ${number}`;
    }
    updateBasicLiberal({ customCourses: [...courses, { name: newName, credits: 2 }] });
  }

  // 입학년도 기본 목록으로 되돌린다.
  function resetToDefault() {
    if (!window.confirm("직접 수정한 목록이 사라지고 입학년도 기본 목록으로 돌아갑니다. 계속할까요?")) return;
    updateBasicLiberal({ customCourses: null, checked: {} });
    setIsEditing(false);
  }

  const { earnedCredits, requiredCredits } = requirement.detail;

  return (
    <RequirementPage title={requirement.title} completed={requirement.completed} onBack={onBack}>
      <section className="card">
        <div className="section-head">
          <h2>{state.admissionYear}학번 필수 과목</h2>
          <button className="button small secondary" onClick={() => (isEditing ? setIsEditing(false) : startEditing())}>
            {isEditing ? "수정 끝내기" : "목록 수정"}
          </button>
        </div>

        {isCustomized && <p className="help">직접 수정한 목록을 사용 중이에요.</p>}

        {!isEditing && (
          <ul className="check-list">
            {courses.map((course) => (
              <li key={course.name}>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={basicLiberal.checked[course.name] === true}
                    onChange={(e) => toggleCourse(course.name, e.target.checked)}
                  />
                  <span>{course.name}</span>
                  <span className="meta">{course.credits}학점</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        {isEditing && (
          <>
            <p className="help">학번에 따라 과목이 다르면 이름·학점을 고치거나 과목을 추가·삭제하세요.</p>
            <ul className="edit-list">
              {courses.map((course, index) => (
                <li key={course.name} className="edit-row">
                  <CourseNameInput name={course.name} onCommit={(newName) => renameCourse(index, newName)} />
                  <input
                    className="input narrow"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={course.credits}
                    onChange={(e) => changeCredits(index, Number(e.target.value) || 0)}
                  />
                  <span className="meta">학점</span>
                  <button className="button small danger" onClick={() => removeCourse(index)}>삭제</button>
                </li>
              ))}
            </ul>
            <div className="button-row left">
              <button className="button small secondary" onClick={addCourse}>+ 과목 추가</button>
              {isCustomized && (
                <button className="button small secondary" onClick={resetToDefault}>기본 목록으로 되돌리기</button>
              )}
            </div>
          </>
        )}

        <p className="result-line">{earnedCredits} / {requiredCredits}학점</p>
      </section>
    </RequirementPage>
  );
}

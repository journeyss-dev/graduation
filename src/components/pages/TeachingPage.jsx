import RequirementPage from "../RequirementPage.jsx";
import CourseCheckRow from "../CourseCheckRow.jsx";
import StatusLine from "../StatusLine.jsx";
import { setCourseChecked, isChecked } from "../courseHelpers.js";
import { teachingCourses, teachingExclusiveGroups } from "../../rules/courses.js";
import { teaching, countRequirements } from "../../rules/requirements.js";
import { isCourseAvailableForTrack } from "../../logic/utils.js";

// 요건 8: 교직과정 화면.
// 교직소양 6학점 + 교직이론 12학점 + 교육실습 + 횟수 요건(적성검사·심폐소생술 등)을 확인한다.
export default function TeachingPage({ requirement, state, onChange, onBack }) {
  const detail = requirement.detail;

  // "하나만 선택" 묶음(교직실무 2학점 / 1학점)에서 다른 과목이 이미 체크되어 있으면 true.
  // 이 경우 이 과목은 체크할 수 없게 막는다. (먼저 다른 쪽 체크를 풀어야 바꿀 수 있다)
  function isBlockedByExclusiveCourse(code) {
    const group = teachingExclusiveGroups.find((codes) => codes.includes(code));
    if (!group) return false;
    return group.some((otherCode) => otherCode !== code && isChecked(state, otherCode));
  }

  // 교직실무 두 과목에 붙일 안내 문구. 하나를 체크하면 다른 하나는 선택할 수 없다는 점을 알려준다.
  function noteForLiteracyCourse(code) {
    if (!teachingExclusiveGroups.some((codes) => codes.includes(code))) return "";
    if (isBlockedByExclusiveCourse(code)) return "(다른 교직실무를 선택해서 체크할 수 없어요)";
    return code === "04718" ? "(이전 학번 이수자용 · 둘 중 하나만 선택)" : "(둘 중 하나만 선택)";
  }

  // 횟수 요건 입력값을 바꾼다.
  function changeCount(id, count) {
    onChange({ counts: { ...state.counts, [id]: Math.max(0, count) } });
  }

  // 영역별 과목 목록
  const sections = [
    { title: "교직소양영역", group: "literacy", hint: `${teaching.literacyCredits}학점 이상` },
    { title: "교직이론영역", group: "theory", hint: `${teaching.theoryCredits}학점 이상` },
  ];

  return (
    <RequirementPage title={requirement.title} completed={requirement.completed} onBack={onBack}>
      <section className="card">
        <StatusLine label="교직소양" value={detail.literacyCredits} target={teaching.literacyCredits} unit="학점" />
        <StatusLine label="교직이론" value={detail.theoryCredits} target={teaching.theoryCredits} unit="학점" />
        <StatusLine label="교육실습 과목" value={detail.practiceCourseCount} target={detail.requiredPractice.courses} unit="과목" />
        <StatusLine label="교육실습 학점" value={detail.practiceCredits} target={detail.requiredPractice.credits} unit="학점" />
        {detail.missingRequired.length > 0 && (
          <div className="notice warn">아직 이수하지 않은 필수 과목: {detail.missingRequired.join(", ")}</div>
        )}
      </section>

      {sections.map((section) => (
        <section key={section.group} className="card">
          <div className="section-head">
            <h2>{section.title}</h2>
            <span className="meta">{section.hint}</span>
          </div>
          <ul className="check-list">
            {teachingCourses
              .filter((course) => course.group === section.group)
              .map((course) => (
                <li key={course.code}>
                  <CourseCheckRow
                    course={course}
                    checked={isChecked(state, course.code)}
                    onToggle={(value) => setCourseChecked(state, onChange, course.code, value)}
                    disabled={isBlockedByExclusiveCourse(course.code)}
                    note={noteForLiteracyCourse(course.code)}
                  />
                </li>
              ))}
          </ul>
        </section>
      ))}

      <section className="card">
        <div className="section-head">
          <h2>교육실습영역</h2>
          <span className="meta">
            {detail.requiredPractice.courses}과목 {detail.requiredPractice.credits}학점 이상
          </span>
        </div>
        <ul className="check-list">
          {teachingCourses
            .filter((course) => course.group === "practice" && isCourseAvailableForTrack(course, state.trackId))
            .map((course) => (
              <li key={course.code}>
                <CourseCheckRow
                  course={course}
                  checked={isChecked(state, course.code)}
                  onToggle={(value) => setCourseChecked(state, onChange, course.code, value)}
                  note={course.code === "05699" ? "(복수전공: 제2전공 교과)" : ""}
                />
              </li>
            ))}
        </ul>
      </section>

      <section className="card">
        <h2>횟수로 확인하는 항목</h2>
        <p className="help">지금까지 받은 횟수를 입력하세요.</p>
        <div className="notice warn">
          ⚠ 입력하는 수고를 줄이려고 기본값을 모두 채운 횟수로 해 두었어요. 실제로 모두 받았는지 반드시 확인하고, 다르면 숫자를 고쳐 주세요.
        </div>
        {detail.counts.items.map((item) => {
          const rule = countRequirements.find((requirementItem) => requirementItem.id === item.id);
          return (
            <div key={item.id} className="count-row">
              <span className="grow">
                {item.label}
                {rule.note && <span className="meta"> ({rule.note})</span>}
              </span>
              <input
                className="input narrow"
                type="number"
                min="0"
                inputMode="numeric"
                value={item.count}
                onChange={(e) => changeCount(item.id, Number(e.target.value) || 0)}
              />
              <span className={`status ${item.completed ? "done" : "todo"}`}>
                {item.count} / {item.requiredCount}회
              </span>
            </div>
          );
        })}

        {/* 마지막 학기에 받는 항목은 완료 조건에서는 빠지지만, 반드시 받아야 한다는 경고를 계속 보여준다 */}
        {countRequirements
          .filter((rule) => rule.warning)
          .map((rule) => (
            <div key={rule.id} className="notice warn">⚠ {rule.warning}</div>
          ))}
      </section>
    </RequirementPage>
  );
}

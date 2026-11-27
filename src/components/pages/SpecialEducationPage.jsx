import RequirementPage from "../RequirementPage.jsx";
import CourseCheckRow from "../CourseCheckRow.jsx";
import StatusLine from "../StatusLine.jsx";
import DuplicationNotice from "../DuplicationNotice.jsx";
import { setCourseChecked, isChecked } from "../courseHelpers.js";
import { majorCourses } from "../../rules/courses.js";
import { specialEducation, duplication as duplicationRule } from "../../rules/requirements.js";
import { getTrack } from "../../logic/utils.js";
import { DIAGNOSIS_CODE } from "../../logic/major.js";

// 요건 6: 특수교육 화면.
// 기본이수 7과목 21학점 + 전체 14과목 42학점 + 필수 과목을 확인한다.
// - 직업교육을 쓰는 유형: 표시과목에서 체크한 중복과목이 여기에 자동으로 인정된다. (맨 아래 "중복과목 현황")
// - 직업교육을 쓰지 않는 유형(부전공, 복수전공-특수 2전공): 중복과목을 이 화면에서 직접 체크한다.
export default function SpecialEducationPage({ requirement, result, state, onChange, onBack }) {
  const detail = requirement.detail;
  const track = getTrack(state.trackId);

  // 특수교육 쪽에서 체크하는 과목 (진단평가는 특수교육/직업교육 양쪽 소속이라 여기에 함께 보여준다)
  const specialCourses = majorCourses.filter((course) => course.area === "special" || course.area === "both");
  const basicCourses = specialCourses.filter((course) => course.group === "basic");
  const otherCourses = specialCourses.filter((course) => course.group !== "basic");

  // 직업교육 과목 중 중복과목. 직업교육을 쓰지 않는 유형(부전공, 복수전공-특수 2전공)은
  // 표시과목 화면이 없어서, 이 중복과목을 여기서 특수교육 과목으로 체크한다.
  const duplicateCourses = majorCourses.filter((course) => course.area === "job" && course.canDuplicate);

  // 진단평가 한 줄을 만든다.
  //  - 표시과목(직업교육)에서 이미 선택했다면: 취소선 + 안내를 보여주고 여기서는 체크할 수 없다.
  //    (이 경우 맨 아래 "중복과목 현황"에 중복과목으로 들어간다)
  //  - 그렇지 않으면: 여기서 체크할 수 있고, 체크하면 특수교육 기본이수로 선택한 것이 된다.
  function renderDiagnosis(course) {
    const checked = isChecked(state, course.code);
    const chosenInJob = track.usesJobEducation && checked && state.diagnosisAssignedTo === "job";

    if (chosenInJob) {
      return (
        <li key={course.code}>
          <CourseCheckRow course={course} checked={false} disabled strike note="직업교육 기본이수 과목으로 선택한 과목입니다." />
        </li>
      );
    }

    return (
      <li key={course.code}>
        <CourseCheckRow
          course={course}
          checked={checked}
          onToggle={(value) =>
            onChange({ checkedCourses: { ...state.checkedCourses, [course.code]: value }, diagnosisAssignedTo: "special" })
          }
        />
      </li>
    );
  }

  // 과목 한 줄을 만든다.
  function renderCourse(course) {
    if (course.code === DIAGNOSIS_CODE) return renderDiagnosis(course);

    return (
      <li key={course.code}>
        <CourseCheckRow
          course={course}
          checked={isChecked(state, course.code)}
          onToggle={(value) => setCourseChecked(state, onChange, course.code, value)}
        />
      </li>
    );
  }

  return (
    <RequirementPage title={requirement.title} completed={requirement.completed} onBack={onBack}>
      <section className="card">
        <StatusLine label="기본이수과목" value={detail.basicCourseCount} target={specialEducation.basicCourses} unit="과목" />
        <StatusLine label="기본이수 학점" value={detail.basicCredits} target={specialEducation.basicCredits} unit="학점" />
        <StatusLine label="전체 과목" value={detail.courseCount} target={specialEducation.totalCourses} unit="과목" />
        <StatusLine label="전체 학점" value={detail.totalCredits} target={specialEducation.totalCredits} unit="학점" />
        {detail.missingRequired.length > 0 && (
          <div className="notice warn">아직 이수하지 않은 필수 과목: {detail.missingRequired.join(", ")}</div>
        )}
      </section>

      <section className="card">
        <h2>기본이수과목</h2>
        <ul className="check-list">{basicCourses.map(renderCourse)}</ul>
      </section>

      <section className="card">
        <h2>그 외 특수교육 과목</h2>
        <ul className="check-list">{otherCourses.map(renderCourse)}</ul>
      </section>

      {!track.usesJobEducation && (
        <section className="card">
          <h2>중복과목</h2>
          <p className="help">
            직업교육 과목이지만, 이 이수 유형에서는 특수교육 과목으로 인정되는 중복과목이에요.
            최대 {duplicationRule.maxCourses}과목 {duplicationRule.maxCredits}학점까지 인정됩니다.
          </p>
          <ul className="check-list">
            {duplicateCourses.map((course) => (
              <li key={course.code}>
                {/* "필수"는 직업교육 표시과목 기준이라, 이 유형에서는 필수 표시를 숨긴다 */}
                <CourseCheckRow
                  course={{ ...course, required: false }}
                  checked={isChecked(state, course.code)}
                  onToggle={(value) => setCourseChecked(state, onChange, course.code, value)}
                  note="(중복과목)"
                />
              </li>
            ))}
          </ul>
          {result.duplication.overflow.length > 0 && (
            <div className="notice warn">
              한도를 넘어서 인정되지 않는 중복과목이 있어요: {result.duplication.overflow.map((course) => course.name).join(", ")}
            </div>
          )}
        </section>
      )}

      {track.usesJobEducation && <DuplicationNotice duplication={result.duplication} />}
    </RequirementPage>
  );
}

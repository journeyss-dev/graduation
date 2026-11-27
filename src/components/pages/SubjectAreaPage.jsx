import RequirementPage from "../RequirementPage.jsx";
import CourseCheckRow from "../CourseCheckRow.jsx";
import StatusLine from "../StatusLine.jsx";
import DuplicationNotice from "../DuplicationNotice.jsx";
import SecondMajorPanel from "../SecondMajorPanel.jsx";
import { setCourseChecked, isChecked } from "../courseHelpers.js";
import { majorCourses } from "../../rules/courses.js";
import { jobEducation } from "../../rules/requirements.js";
import { getTrack } from "../../logic/utils.js";
import { DIAGNOSIS_CODE } from "../../logic/major.js";

// 요건 5: 표시과목 화면.
//  - 직업교육을 쓰는 이수 유형(제1전공심화 등): 직업교육 과목을 체크한다.
//  - 그 외(부전공, 복수전공-특수 2전공): 제2전공 입력 칸을 보여준다.
export default function SubjectAreaPage({ requirement, result, state, onChange, onBack }) {
  const track = getTrack(state.trackId);

  if (!track.usesJobEducation) {
    return (
      <RequirementPage title={requirement.title} completed={requirement.completed} onBack={onBack}>
        <SecondMajorPanel state={state} onChange={onChange} />
      </RequirementPage>
    );
  }

  const detail = requirement.detail;
  const jobCourses = majorCourses.filter((course) => course.area === "job" || course.area === "both");

  // 진단평가는 특수교육/직업교육 기본이수 중 한쪽으로만 선택할 수 있다.
  // 특수교육 기본이수로 이미 선택했다면 여기서는 체크할 수 없다.
  const diagnosisChecked = isChecked(state, DIAGNOSIS_CODE);
  const diagnosisChosenInSpecial = diagnosisChecked && state.diagnosisAssignedTo === "special";

  // 진단평가 체크 상태를 바꾼다. 여기서 체크하면 직업교육 기본이수로 선택한 것이 된다.
  function toggleDiagnosis(checked) {
    onChange({ checkedCourses: { ...state.checkedCourses, [DIAGNOSIS_CODE]: checked }, diagnosisAssignedTo: "job" });
  }

  // 과목 한 줄을 만든다.
  function renderCourse(course) {
    if (course.code === DIAGNOSIS_CODE) {
      return (
        <li key={course.code}>
          <CourseCheckRow
            course={course}
            checked={diagnosisChecked && !diagnosisChosenInSpecial}
            disabled={diagnosisChosenInSpecial}
            onToggle={toggleDiagnosis}
            note={diagnosisChosenInSpecial ? "특수교육 기본이수 과목으로 선택했어요." : "(중복과목)"}
          />
        </li>
      );
    }

    return (
      <li key={course.code}>
        <CourseCheckRow
          course={course}
          checked={isChecked(state, course.code)}
          onToggle={(value) => setCourseChecked(state, onChange, course.code, value)}
          note={course.canDuplicate ? "(중복과목)" : ""}
        />
      </li>
    );
  }

  // 영역별 과목 목록
  const sections = [
    { title: "기본이수과목", courses: jobCourses.filter((c) => c.group === "basic") },
    { title: "교과교육영역", courses: jobCourses.filter((c) => c.group === "subjectEducation") },
    { title: "교육과정영역", courses: jobCourses.filter((c) => c.group === "curriculum") },
    { title: "그 외 직업교육 과목", courses: jobCourses.filter((c) => c.group === "general") },
  ];

  return (
    <RequirementPage title={requirement.title} completed={requirement.completed} onBack={onBack}>
      <section className="card">
        <StatusLine label="기본이수과목" value={detail.basicCourseCount} target={jobEducation.basicCourses} unit="과목" />
        <StatusLine label="기본이수 학점" value={detail.basicCredits} target={jobEducation.basicCredits} unit="학점" />
        <StatusLine label="교과교육영역" value={detail.subjectEducationCredits} target={jobEducation.subjectEducationCredits} unit="학점" />
        <StatusLine label="교육과정영역" value={detail.curriculumCredits} target={jobEducation.curriculumCredits} unit="학점" />
        <StatusLine label="표시과목 전체" value={detail.totalCredits} target={jobEducation.totalCredits} unit="학점" />
        {detail.missingRequired.length > 0 && (
          <div className="notice warn">아직 이수하지 않은 필수 과목: {detail.missingRequired.join(", ")}</div>
        )}
        <p className="help">
          표시과목은 교육부 지침으로는 38학점이지만, 과목이 모두 3학점이라 학과 내규에 따라 39학점을 이수합니다.
        </p>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="card">
          <h2>{section.title}</h2>
          <ul className="check-list">{section.courses.map(renderCourse)}</ul>
        </section>
      ))}

      <DuplicationNotice duplication={result.duplication} />
    </RequirementPage>
  );
}

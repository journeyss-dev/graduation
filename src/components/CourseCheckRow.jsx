// 과목 하나를 체크박스 한 줄로 보여준다. (전공·교직 체크 화면에서 공통으로 사용)
// - course: 과목 데이터 (rules/courses.js 의 항목)
// - checked: 체크 여부
// - onToggle(checked): 체크가 바뀔 때
// - note: 과목명 옆에 붙일 작은 안내 (선택)
// - disabled: 체크할 수 없게 막을지 (선택)
// - strike: 과목명에 취소선을 그을지 (다른 영역에서 이미 선택한 과목 표시용, 선택)
export default function CourseCheckRow({ course, checked, onToggle = () => {}, note = "", disabled = false, strike = false }) {
  return (
    <label className={`check-row ${disabled ? "disabled" : ""}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onToggle(e.target.checked)} />
      <span className="course-name">
        <span className={strike ? "strike" : ""}>{course.name}</span>
        {course.required && <span className="badge">필수</span>}
        {note && <span className="meta note"> {note}</span>}
      </span>
      <span className="meta">
        {course.term ? `${course.term} · ` : ""}
        {course.credits}학점
      </span>
    </label>
  );
}

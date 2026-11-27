import { duplication as duplicationRule } from "../rules/requirements.js";

// 중복 인정 현황 안내. 직업교육과 특수교육 양쪽에서 동시에 인정되는 과목(최대 5과목·15학점)을 보여주고,
// 한도를 넘어 인정되지 않은 과목이 있으면 경고한다.
// - duplication: evaluateGraduation 결과의 duplication ({ accepted, overflow, credits })
export default function DuplicationNotice({ duplication }) {
  const { accepted, overflow, credits } = duplication;

  return (
    <section className="card">
      <h2>중복 인정 (자동 인정된 과목)</h2>
      <p className="help">
        직업교육과 특수교육 양쪽에 인정되는 과목은 최대 {duplicationRule.maxCourses}과목 {duplicationRule.maxCredits}학점까지
        중복으로 인정돼요. 표시과목(직업교육)에서 체크한 과목 중 중복 대상은 특수교육에도 자동으로 들어옵니다.
      </p>
      <p className="result-line">
        현재 {accepted.length}과목 {credits}학점 인정
      </p>

      {accepted.length > 0 && (
        <ul className="plain-list">
          {accepted.map(({ course, alsoCountedIn }) => (
            <li key={course.code}>
              {course.name} <span className="meta">→ {alsoCountedIn === "special" ? "특수교육에도" : "표시과목에도"} 인정</span>
            </li>
          ))}
        </ul>
      )}

      {overflow.length > 0 && (
        <div className="notice warn">
          한도를 넘어서 중복으로 인정되지 않는 과목이 있어요:{" "}
          {overflow.map(({ course }) => course.name).join(", ")}
        </div>
      )}
    </section>
  );
}

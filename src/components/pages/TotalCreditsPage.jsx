import RequirementPage from "../RequirementPage.jsx";
import { TOTAL_REQUIRED_CREDITS } from "../../rules/requirements.js";

// 요건 1: 총 이수 학점 입력 화면.
// 학교 포털의 성적 조회 화면에서 "취득 학점 합계"를 확인해 입력한다.
// - requirement: 이 요건의 판정 결과
// - state, onChange: 학생 입력 상태와 변경 함수
export default function TotalCreditsPage({ requirement, state, onChange, onBack }) {
  return (
    <RequirementPage title={requirement.title} completed={requirement.completed} onBack={onBack}>
      <section className="card">
        <p className="help">성적 조회 화면에서 확인한 지금까지의 총 취득 학점을 입력하세요.</p>
        <div className="notice warn">
          ⚠ 입력하는 수고를 줄이려고 기본값을 {TOTAL_REQUIRED_CREDITS}학점으로 해 두었어요.
          실제로 {TOTAL_REQUIRED_CREDITS}학점 이상을 이수했는지 성적 조회에서 반드시 확인하고, 다르면 숫자를 고쳐 주세요.
        </div>

        <label className="field">
          <span>총 이수 학점</span>
          <input
            className="input"
            type="number"
            min="0"
            max="300"
            inputMode="numeric"
            value={state.totalCredits}
            onChange={(event) => onChange({ totalCredits: Math.max(0, Number(event.target.value) || 0) })}
          />
        </label>

        <p className="result-line">
          {state.totalCredits} / {TOTAL_REQUIRED_CREDITS}학점
          {state.totalCredits < TOTAL_REQUIRED_CREDITS && ` (${TOTAL_REQUIRED_CREDITS - state.totalCredits}학점 부족)`}
        </p>
      </section>
    </RequirementPage>
  );
}

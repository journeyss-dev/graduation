import RequirementPage from "../RequirementPage.jsx";
import { graduationCertification } from "../../rules/requirements.js";

// 졸업 인증 화면.
// 졸업시험 / 졸업논문 / 어학 성적 / 한국사 중 하나를 통과하면 된다.
// 어떤 방법을 썼는지는 저장하지 않고, "통과했다"만 체크한다.
export default function CertificationPage({ requirement, state, onChange, onBack }) {
  return (
    <RequirementPage title={requirement.title} completed={requirement.completed} onBack={onBack}>
      <section className="card">
        <h2>졸업 인증 방법 (택 1)</h2>
        <ul className="plain-list option-info">
          {graduationCertification.options.map((option) => {
            const isRecommended = option.id === graduationCertification.recommended;
            return (
              <li key={option.id} className={isRecommended ? "recommended" : ""}>
                <strong>{option.label}</strong>
                {isRecommended && <span className="badge">추천</span>}
                <p className="meta">{option.summary}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card">
        <label className="check-row">
          <input
            type="checkbox"
            checked={state.certificationPassed}
            onChange={(e) => onChange({ certificationPassed: e.target.checked })}
          />
          <span>위 방법 중 하나를 통과했어요</span>
        </label>
      </section>
    </RequirementPage>
  );
}

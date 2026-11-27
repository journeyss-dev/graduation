import { getTrack } from "../logic/utils.js";

// 제2전공 입력 칸. 이수 유형에 따라 두 가지 방식으로 보여준다.
//  - 복수전공: 이수 기준이 학과마다 달라서, 학과에 확인한 뒤 "충족했어요"를 직접 체크한다.
//  - 부전공: 제2전공에서 이수한 학점(기본이수 / 교과교육 / 전체)을 직접 입력한다.
// - state, onChange: 학생 입력 상태와 변경 함수
export default function SecondMajorPanel({ state, onChange }) {
  const track = getTrack(state.trackId);
  const secondMajor = track.secondMajor;

  // 복수전공
  if (secondMajor.selfCheck) {
    return (
      <section className="card">
        <h2>제2전공 이수 확인</h2>
        <div className="notice info">{secondMajor.notice}</div>
        <label className="check-row">
          <input
            type="checkbox"
            checked={state.secondMajorConfirmed}
            onChange={(e) => onChange({ secondMajorConfirmed: e.target.checked })}
          />
          <span>제2전공 학과에 확인했고, 이수 기준을 충족했어요</span>
        </label>
      </section>
    );
  }

  // 부전공: 입력 항목과 필요 학점
  const fields = [
    { key: "basic", label: "기본이수과목 학점", required: secondMajor.basicCredits },
    { key: "subjectEducation", label: "교과교육영역 학점", required: secondMajor.subjectEducationCredits },
    { key: "total", label: "제2전공 전체 학점", required: secondMajor.credits },
  ];

  return (
    <section className="card">
      <h2>제2전공(부전공) 이수 학점</h2>
      <p className="help">제2전공 학과에서 이수한 학점을 입력하세요.</p>

      {fields.map((field) => (
        <label key={field.key} className="field">
          <span>
            {field.label} <span className="meta">({field.required}학점 이상)</span>
          </span>
          <input
            className="input"
            type="number"
            min="0"
            inputMode="numeric"
            value={state.secondMajorCredits[field.key]}
            onChange={(e) =>
              onChange({ secondMajorCredits: { ...state.secondMajorCredits, [field.key]: Math.max(0, Number(e.target.value) || 0) } })
            }
          />
        </label>
      ))}
    </section>
  );
}

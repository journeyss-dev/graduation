import { useState } from "react";
import { getAdmissionYears, getDefaultAdmissionYear, getLatestRuleYear } from "../rules/liberalArts.js";
import { tracks } from "../rules/requirements.js";

// 입학년도와 이수 유형을 고르는 첫 화면. (다시 고르려면 상단의 "처음으로"를 누른다)
// - onSubmit(year, trackId): "시작하기"를 눌렀을 때
export default function SetupScreen({ onSubmit }) {
  // 기본으로 "올해 - 3" 학번이 선택되어 있다. (4학년이 가장 많이 쓰기 때문)
  const [year, setYear] = useState(getDefaultAdmissionYear());
  const [trackId, setTrackId] = useState("first-major");

  return (
    <main className="screen">
      <header className="screen-header">
        <p className="eyebrow">가톨릭대학교 특수교육과</p>
        <h1>졸업사정 자가체크</h1>
        <p className="lead">
          입학년도와 이수 유형을 고르면, 졸업 요건을 하나씩 체크해 볼 수 있어요.
          입력한 내용은 이 브라우저에 자동으로 저장됩니다.
        </p>
      </header>

      <section className="card">
        <h2>1. 입학년도</h2>

        {/* 학번이 해마다 늘어나므로 버튼 대신 목록(select)으로 고른다 */}
        <select
          className="select"
          value={year ?? ""}
          onChange={(event) => setYear(event.target.value === "" ? null : Number(event.target.value))}
        >
          <option value="">입학년도를 선택하세요</option>
          {getAdmissionYears().map((admissionYear) => (
            <option key={admissionYear} value={admissionYear}>
              {admissionYear}학번
            </option>
          ))}
        </select>

        {/* 기준이 아직 등록되지 않은 새 학번이면 가장 최근 기준을 쓴다는 것을 알려준다 */}
        {year !== null && year > getLatestRuleYear() && (
          <p className="help">
            아직 {year}학번 기준이 등록되지 않아, 가장 최근({getLatestRuleYear()}학번) 기준으로 확인합니다.
          </p>
        )}
      </section>

      <section className="card">
        <h2>2. 이수 유형</h2>
        <p className="help">교직과정을 어떤 방식으로 이수하는지 골라 주세요.</p>
        <div className="option-list">
          {tracks.map((track) => (
            <label key={track.id} className={`option ${trackId === track.id ? "selected" : ""}`}>
              <input
                type="radio"
                name="track"
                checked={trackId === track.id}
                onChange={() => setTrackId(track.id)}
              />
              <span className="option-title">{track.label}</span>
              <span className="option-sub">{track.certificate}</span>
              <span className="option-sub">{track.creditSummary}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="button-row">
        <button className="button primary" disabled={year === null} onClick={() => onSubmit(year, trackId)}>
          시작하기
        </button>
      </div>
    </main>
  );
}

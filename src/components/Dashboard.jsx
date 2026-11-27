import { describeShortfalls, summarizeRequirement } from "../logic/summary.js";
import { getTrack } from "../logic/utils.js";
import { countRequirements } from "../rules/requirements.js";
import BackupPanel from "./BackupPanel.jsx";
import CourseOverview from "./CourseOverview.jsx";

// 졸업 요건 전체 현황 화면. 요건별 이수 여부·요약, 전체 진행률, 아직 남은 일을 보여준다.
// - state: 학생 입력 상태
// - result: evaluateGraduation 의 판정 결과
// - availablePageIds: 체크 화면이 준비된 요건 id 목록 (준비된 요건만 눌러서 들어갈 수 있다)
// - onOpenRequirement(id): 요건을 눌렀을 때
// - onImport(newState): 백업 파일에서 불러온 입력을 적용
export default function Dashboard({ state, result, availablePageIds, onOpenRequirement, onImport }) {
  const track = getTrack(state.trackId);
  const totalCount = result.requirements.length;
  const progressPercent = Math.round((result.completedCount / totalCount) * 100);

  // 아직 이수하지 못한 요건과 그 이유
  const unfinished = result.requirements
    .map((requirement) => ({ requirement, lines: describeShortfalls(requirement) }))
    .filter((item) => !item.requirement.completed);

  // 이수 여부와 상관없이 계속 알려야 하는 경고 (예: 마지막 학기에 받는 마약류 검사)
  const reminders = countRequirements.filter((rule) => rule.warning && (state.counts[rule.id] ?? 0) < rule.requiredCount);

  return (
    <main className="screen">
      <header className="screen-header">
        <p className="eyebrow">{state.admissionYear}학번 · {track.label}</p>
        <h1>졸업 요건 현황</h1>
      </header>

      <section className="card">
        <div className="progress-head">
          <strong>{result.completedCount} / {totalCount} 요건 충족</strong>
          <span>{progressPercent}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        {result.allCompleted && <p className="success-note">모든 요건을 충족했어요. 졸업 사정을 신청할 수 있습니다.</p>}
        {reminders.map((rule) => (
          <div key={rule.id} className="notice warn">⚠ {rule.warning}</div>
        ))}
      </section>

      <section className="card">
        <ul className="requirement-list">
          {result.requirements.map((requirement) => {
            const isAvailable = availablePageIds.includes(requirement.id);

            return (
              <li key={requirement.id}>
                <button
                  className="requirement-item"
                  disabled={!isAvailable}
                  onClick={() => onOpenRequirement(requirement.id)}
                >
                  <span className={`status ${requirement.completed ? "done" : "todo"}`}>
                    {requirement.completed ? "이수" : "미이수"}
                  </span>
                  <span className="requirement-text">
                    <span className="requirement-title">{requirement.title}</span>
                    <span className="requirement-summary">
                      {isAvailable ? summarizeRequirement(requirement) : "준비 중"}
                    </span>
                  </span>
                  {isAvailable && <span className="chevron">›</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {unfinished.length > 0 && (
        <section className="card">
          <h2>아직 남은 일</h2>
          <ul className="shortfall-list">
            {unfinished.map(({ requirement, lines }) => (
              <li key={requirement.id}>
                <strong>{requirement.title}</strong>
                {lines.length > 0 && (
                  <ul>
                    {lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <CourseOverview state={state} result={result} />

      {track.secondMajor?.selfCheck && <p className="help">{track.secondMajor.notice}</p>}
      <p className="help">이 결과는 참고용이에요. 정확한 내용은 학과 홈페이지를 확인하고 학과 조교님께 상담받아 주세요.</p>

      <BackupPanel state={state} onImport={onImport} />

      <div className="button-row">
        <button className="button secondary" onClick={() => window.print()}>인쇄 / PDF 저장</button>
      </div>
    </main>
  );
}

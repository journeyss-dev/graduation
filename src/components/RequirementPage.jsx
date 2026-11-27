// 요건별 체크 화면의 공통 틀. 위쪽에 "← 현황으로" 버튼과 제목, 이수 여부를 보여주고
// 그 아래에 각 요건의 입력 화면(children)을 넣는다.
// - title: 요건 이름
// - completed: 이수 여부
// - onBack: 현황 화면으로 돌아가기
export default function RequirementPage({ title, completed, onBack, children }) {
  return (
    <main className="screen">
      <button className="back-link" onClick={onBack}>← 현황으로</button>

      <header className="page-title">
        <h1>{title}</h1>
        <span className={`status ${completed ? "done" : "todo"}`}>{completed ? "이수" : "미이수"}</span>
      </header>

      {children}

      <div className="button-row">
        <button className="button primary" onClick={onBack}>완료</button>
      </div>
    </main>
  );
}

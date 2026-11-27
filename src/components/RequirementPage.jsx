import Icon from "./Icon.jsx";

// 요건별 체크 화면의 공통 틀. 위쪽에 "현황으로 / 완료" 버튼 줄(스크롤해도 따라다님)과 제목, 이수 여부를 보여주고
// 그 아래에 각 요건의 입력 화면(children)을 넣는다. 아래쪽에도 "완료" 버튼이 있다.
// - title: 요건 이름
// - completed: 이수 여부
// - onBack: 현황 화면으로 돌아가기
export default function RequirementPage({ title, completed, onBack, children }) {
  return (
    <main className="screen">
      <div className="page-toolbar">
        <button className="pill" onClick={onBack}>
          <Icon name="arrowLeft" />
          현황으로
        </button>
        <button className="pill primary" onClick={onBack}>
          <Icon name="check" />
          완료
        </button>
      </div>

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

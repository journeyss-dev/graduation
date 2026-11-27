import { GRADUATION_INFO_URL, departmentContact } from "../rules/requirements.js";

// 맨 처음 보이는 안내 화면.
// 이 페이지가 참고용이라는 점과, 정확한 내용은 홈페이지·학과 조교에게 확인해야 한다는 점을 먼저 알린다.
// - onStart: "확인했어요" 버튼을 눌렀을 때 (입학년도·이수 유형 선택 화면으로 이동)
export default function IntroScreen({ onStart }) {
  return (
    <main className="screen">
      <header className="screen-header">
        <p className="eyebrow">가톨릭대학교 특수교육과</p>
        <h1>졸업사정 자가체크</h1>
        <p className="lead">
          이 페이지는 가톨릭대학교 특수교육과 학생들의 졸업사정을 돕기 위한 페이지입니다.
        </p>
      </header>

      <section className="card">
        <h2>시작하기 전에 꼭 읽어 주세요</h2>
        <ul className="notice-list">
          <li>
            <strong>참고용으로만 사용해 주세요.</strong>
            <span>졸업 요건을 계산하는 방식에 오류가 있을 수 있어요. 이 결과가 졸업을 보장하지 않습니다.</span>
          </li>
          <li>
            <strong>정확한 내용은 꼭 확인해 주세요.</strong>
            <span>
              <a href={GRADUATION_INFO_URL} target="_blank" rel="noopener noreferrer">학과 홈페이지의 졸업 요건</a>을
              확인하고, 학과 조교님께 상담을 받아 주세요.
            </span>
          </li>
          <li>
            <strong>입력한 내용은 내 기기에만 저장돼요.</strong>
            <span>서버로 전송되지 않고, 이 브라우저에만 저장됩니다.</span>
          </li>
        </ul>

        <p className="help">
          학과 사무실 {departmentContact.phone} · {departmentContact.email}
        </p>
      </section>

      <div className="button-row">
        <button className="button primary" onClick={onStart}>확인했어요, 시작하기</button>
      </div>
    </main>
  );
}

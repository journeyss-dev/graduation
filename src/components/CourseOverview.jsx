import { useState } from "react";
import { buildCourseOverview } from "../logic/overview.js";

// 체크한 과목을 영역별로 한눈에 보여주는 카드.
// 화면에서는 "펼치기/접기"로 볼 수 있고, 인쇄할 때는 항상 펼쳐져서 내역이 함께 출력된다.
// - state: 학생 입력 상태, result: evaluateGraduation 결과
export default function CourseOverview({ state, result }) {
  const [isOpen, setIsOpen] = useState(false);
  const sections = buildCourseOverview(state, result);

  return (
    <section className="card">
      <div className="section-head">
        <h2>체크한 과목 한눈에 보기</h2>
        <button className="button small secondary no-print" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "접기" : "펼치기"}
        </button>
      </div>
      {!isOpen && <p className="help no-print">영역별로 어떤 과목을 체크했는지 모아서 볼 수 있어요.</p>}

      {/* 접혀 있어도 인쇄 화면에서는 보이도록 CSS 에서 처리한다 (.collapsed) */}
      <div className={`overview-body ${isOpen ? "" : "collapsed"}`}>
        {sections.map((section) => (
          <div key={section.id} className="overview-section">
            <div className="overview-head">
              <h3>{section.title}</h3>
              {section.summary && <span className="meta">{section.summary}</span>}
            </div>

            {section.items.length === 0 ? (
              <p className="meta">체크한 내용이 없어요.</p>
            ) : (
              <ul className="overview-list">
                {section.items.map((item, index) => (
                  <li key={`${item.name}-${index}`}>
                    <span>{item.name}</span>
                    <span className="meta">{item.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

import Icon from "./Icon.jsx";
import { GRADUATION_INFO_URL } from "../rules/requirements.js";

// 모든 화면 맨 위에 보이는 상단 바.
// - 처음으로: 입력을 모두 지우고 입학년도·이수 유형 선택 화면으로 돌아간다 (이미 시작한 뒤에만 보임)
// - 졸업요건 확인: 학과 학사정보 페이지를 새 탭으로 연다
// - 화면 모드: 다크모드 ↔ 밝은 화면 전환
// - onHome: "처음으로" 버튼. 아직 시작 전이면 null
// - theme: 현재 모드 ("dark" | "light"), onToggleTheme: 전환 버튼
export default function TopBar({ onHome, theme, onToggleTheme }) {
  const isDark = theme === "dark";

  return (
    <header className="topbar">
      <div className="topbar-group">
        {onHome && (
          <button className="pill" onClick={onHome}>
            <Icon name="home" />
            처음으로
          </button>
        )}
        <span className="topbar-title">졸업사정 자가체크</span>
      </div>

      <div className="topbar-group">
        <a className="pill" href={GRADUATION_INFO_URL} target="_blank" rel="noopener noreferrer">
          졸업요건 확인
          <Icon name="external" size={14} />
        </a>
        <button
          className="pill icon-only"
          onClick={onToggleTheme}
          aria-label={isDark ? "밝은 화면으로 바꾸기" : "다크모드로 바꾸기"}
          title={isDark ? "밝은 화면으로" : "다크모드로"}
        >
          <Icon name={isDark ? "sun" : "moon"} size={18} />
        </button>
      </div>
    </header>
  );
}

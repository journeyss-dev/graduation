import { useEffect, useState } from "react";

const THEME_KEY = "graduation-theme";

// 저장된 화면 모드를 읽는다. 저장된 값이 없거나 읽을 수 없으면 기본값인 다크모드("dark")이다.
function readSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

// 다크모드 / 밝은 화면 전환을 관리한다.
// - theme: 현재 모드 ("dark" | "light")
// - toggleTheme: 모드를 서로 바꾼다. 바꾼 모드는 이 브라우저에 저장된다.
export function useTheme() {
  const [theme, setTheme] = useState(readSavedTheme);

  // 모드가 바뀔 때마다 <html data-theme="..."> 에 반영하고 저장한다. (색상은 index.css 에서 이 값으로 바뀐다)
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // 저장이 막힌 브라우저에서는 이번 방문 동안만 적용된다.
    }
  }, [theme]);

  return { theme, toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")) };
}

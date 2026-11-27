import { useEffect, useState } from "react";
import { clearStudentState, loadStudentState, saveStudentState } from "../storage/studentStorage.js";

// 학생 입력 상태를 관리한다. 화면을 열 때 저장된 값을 불러오고, 값이 바뀔 때마다 자동 저장한다.
// - state: 학생 입력 상태. 아직 입학년도를 고르지 않았으면 null
// - setState: 상태 변경
// - saveFailed: 저장에 실패했는지 (브라우저가 저장을 막은 경우 화면에 안내하기 위해 사용)
// - reset: 저장된 입력을 지우고 처음 상태로 돌아간다
export function useStudentState() {
  const [state, setState] = useState(() => loadStudentState());
  const [saveFailed, setSaveFailed] = useState(false);

  // 상태가 바뀔 때마다 저장한다.
  useEffect(() => {
    if (state === null) return;
    setSaveFailed(!saveStudentState(state));
  }, [state]);

  function reset() {
    clearStudentState();
    setState(null);
  }

  return { state, setState, saveFailed, reset };
}

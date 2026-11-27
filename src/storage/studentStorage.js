// ============================================================
// 학생 입력 저장 (브라우저 localStorage)
// ------------------------------------------------------------
// 서버가 없으므로 학생 브라우저에 저장한다. 새로고침하거나 다시 열어도 입력이 남는다.
// 저장 모양: { version: 1, state: { ...학생 입력 상태 } }
// version은 나중에 입력 구조가 바뀔 때 옛 데이터를 구분하기 위한 번호이다.
// ============================================================

import { createInitialState } from "../logic/studentState.js";
import { FIRST_ADMISSION_YEAR } from "../rules/liberalArts.js";
import { tracks } from "../rules/requirements.js";

const STORAGE_KEY = "graduation-checker";
const STORAGE_VERSION = 1;

// 저장된 내용({ version, state })이 올바른지 확인하고, 학생 입력 상태로 복원한다.
// 버전이 다르거나 입학년도·이수 유형이 올바르지 않으면 null을 돌려준다.
function restoreState(saved) {
  if (saved?.version !== STORAGE_VERSION) return null;

  const { admissionYear, trackId } = saved.state ?? {};
  const isValidYear = Number.isInteger(admissionYear) && admissionYear >= FIRST_ADMISSION_YEAR;
  const isValidTrack = tracks.some((track) => track.id === trackId);
  if (!isValidYear || !isValidTrack) return null;

  // 나중에 입력 항목이 추가되어도 빈 값으로 채워지도록, 기본 상태 위에 저장된 값을 덮어쓴다.
  return { ...createInitialState(admissionYear, trackId), ...saved.state };
}

// 저장된 학생 입력을 불러온다.
// 저장된 값이 없거나, 읽을 수 없거나, 내용이 올바르지 않으면 null을 돌려준다. (처음 시작과 동일하게 처리)
export function loadStudentState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? restoreState(JSON.parse(raw)) : null;
  } catch {
    // 저장소 접근이 막혀 있거나(시크릿 모드 등) 저장된 글자가 깨진 경우
    return null;
  }
}

// 학생 입력을 저장한다. 성공하면 true, 실패하면 false.
export function saveStudentState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, serializeStudentState(state));
    return true;
  } catch {
    return false;
  }
}

// ----- 파일로 백업 / 복원 (다른 기기·브라우저로 옮길 때 사용) -----

// 학생 입력을 백업 파일에 들어갈 글자(JSON)로 만든다.
export function serializeStudentState(state) {
  return JSON.stringify({ version: STORAGE_VERSION, state }, null, 2);
}

// 백업 파일의 글자를 학생 입력 상태로 되돌린다. 올바른 백업 파일이 아니면 null.
export function parseStudentStateText(text) {
  try {
    return restoreState(JSON.parse(text));
  } catch {
    return null;
  }
}

// 저장된 입력을 모두 지운다.
export function clearStudentState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 지울 수 없으면 무시한다.
  }
}

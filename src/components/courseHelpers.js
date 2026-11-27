// 과목 체크 화면에서 공통으로 쓰는 작은 도우미 함수들

// 과목 하나의 체크 상태를 바꾼다.
// - state: 학생 입력 상태, onChange: 입력 변경 함수
export function setCourseChecked(state, onChange, code, checked) {
  onChange({ checkedCourses: { ...state.checkedCourses, [code]: checked } });
}

// 과목이 체크되어 있는지 확인한다.
export function isChecked(state, code) {
  return state.checkedCourses[code] === true;
}

// 이수 시기를 화면에 보여줄 글자로 바꾼다.
// "1-1" → "1-1학기" (학년-학기 형식에만 "학기"를 붙이고, "4학년" 같은 값은 그대로 둔다)
export function formatTerm(term) {
  return /^\d-\d$/.test(term) ? `${term}학기` : term;
}

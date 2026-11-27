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

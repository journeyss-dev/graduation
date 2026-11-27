// ============================================================
// 학생이 화면에서 입력하는 값 (= 저장되는 값)
// ------------------------------------------------------------
// 졸업 요건을 만족했는지 여부는 여기에 저장하지 않는다.
// 판정 함수(evaluateGraduation)가 이 값으로 매번 새로 계산한다.
// ============================================================

// 입학년도나 이수 유형을 바꾸려면 "처음으로"를 눌러 입력을 모두 지우고 다시 시작한다.
// (일부만 남기면 학번·이수 유형에 맞지 않는 입력이 섞일 수 있어서 이렇게 한다.)

// 새 학생 입력 상태를 만든다.
// - admissionYear: 입학년도 (예: 2023)
// - trackId: 이수 유형 id (기본값: 제1전공심화)
export function createInitialState(admissionYear, trackId = "first-major") {
  return {
    admissionYear,
    trackId,

    // 요건 1: 성적표에 표시된 총 이수 학점 (학생이 직접 입력)
    totalCredits: 0,

    // 전공·교직 과목 체크 목록. 예: { "02706": true }
    checkedCourses: {},

    // "특수교육대상학생진단및평가"를 어느 쪽 기본이수로 선택했는지 ("special" | "job")
    // 체크한 화면(특수교육 / 표시과목)에 따라 정해진다. 직업교육에서 선택하면 특수교육에는 자동 인정으로 들어간다.
    diagnosisAssignedTo: "special",

    // 특수교육 과목 중 직업교육(표시과목) 학점으로도 인정받을 과목. 예: { "02424": true }
    // 직업교육 과목은 중복 대상이면 특수교육에도 자동 인정되지만, 반대는 학생이 직접 고른다.
    alsoCountedInJob: {},

    // 기초교양: 과목 목록을 학생이 고친 경우 customCourses에 저장 (null이면 입학년도 기본 목록 사용)
    basicLiberal: {
      customCourses: null, // 예: [{ name: "인간학1", credits: 2 }, ...]
      checked: {}, // 예: { "인간학1": true }
    },

    // 중핵교양: 학생이 입력한 이수 과목. 예: [{ area: "인문·사회", name: "철학의이해", credits: 3 }]
    coreLiberalCourses: [],

    // 전공기초: 사회과학 계열 / 사회과학 외 계열로 이수한 학점 (학생이 직접 입력)
    majorBasicFreeCredits: { social: 0, nonSocial: 0 },

    // 부전공: 학생이 직접 입력하는 제2전공 이수 학점
    secondMajorCredits: { basic: 0, subjectEducation: 0, total: 0 },

    // 복수전공: 제2전공 학과에 이수 기준을 확인하고 충족했다고 직접 체크했는지
    secondMajorConfirmed: false,

    // 횟수로 확인하는 항목. 예: { aptitude: 2, cpr: 1 }
    counts: {},

    // 졸업 인증(한국사 3급, 어학 성적 등)을 통과했는지
    certificationPassed: false,
  };
}

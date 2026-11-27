// ============================================================
// 졸업 요건 기준 (학점 · 과목 수 · 횟수)
// ------------------------------------------------------------
// 출처: 학과 학사정보 페이지(sped.catholic.ac.kr/sped/course/academic.do),
//       졸업사정 자가체크 리스트(시트), 기존 zip 프로젝트의 판정 상수
//
// 학교 기준이 바뀌면 이 파일의 숫자만 고치면 된다. 판정 로직(3단계)은 이 값을 읽어서 쓴다.
// ============================================================

// ---------- 총 이수 학점 ----------
export const TOTAL_REQUIRED_CREDITS = 130;

// ---------- 전공기초 (9학점) ----------
// 필수 1과목(장애의이해와재활 3학점) + 사회과학 계열 3학점 + 사회과학 외 계열 3학점.
// 계열 구분은 학교 홈페이지에서 확인할 수 있으므로, 학생이 과목을 직접 입력하고 계열을 선택한다.
export const majorBasic = {
  totalCredits: 9,
  requiredCredits: 3, // 장애의이해와재활
  freeSlots: [
    { id: "social", label: "사회과학계열", credits: 3 },
    { id: "nonSocial", label: "사회과학 외", credits: 3 },
  ],
};

// ---------- 특수교육 영역 ----------
export const specialEducation = {
  basicCourses: 7, // 기본이수과목 7과목
  basicCredits: 21, // 21학점 이상
  totalCourses: 14, // 전체 14과목
  totalCredits: 42, // 42학점 이상
};

// ---------- 직업교육 표시과목 영역 (제1전공심화 · 복수전공(직업교육)) ----------
// 39학점 = 기본이수 21 + 교과교육 9 + 교육과정 9
// 교육부 지침의 기준은 38학점이지만, 개설 과목이 모두 3학점이라 커리큘럼대로 이수하면
// 3의 배수인 39학점이 된다. 학과 내규가 39학점이므로 화면에서는 39학점으로 안내한다.
// (시트에 적힌 38학점은 교육부 지침 기준이다.)
export const jobEducation = {
  basicCourses: 7,
  basicCredits: 21,
  subjectEducationCredits: 9, // 교과교육영역 3과목
  curriculumCredits: 9, // 교육과정영역 3과목 (21학번부터 필수)
  totalCredits: 39,
};

// ---------- 중복 인정 ----------
// 직업교육과 특수교육 양쪽에서 인정되는 과목은 최대 5과목, 15학점까지만 중복으로 인정한다.
// 그래서 성적표상 전공 학점은 81 - 15 = 66학점이 된다.
export const duplication = {
  maxCourses: 5,
  maxCredits: 15,
};

// ---------- 복수전공의 제2전공 ----------
// 제2전공 이수 학점 기준은 학과마다 다르므로 이 앱이 판정하지 않는다.
// 학생이 해당 학과에 확인한 뒤 "충족했다"고 직접 체크하는 방식(selfCheck)으로 처리한다.
// requiresBasicCourses: 복수전공은 제2전공의 전공기초 과목도 이수해야 한다. (학점은 확인하지 않고 이수 여부만 체크)
const SECOND_MAJOR_ASK_DEPARTMENT = {
  selfCheck: true,
  requiresBasicCourses: true,
  notice: "제2전공 이수 기준은 학과마다 다릅니다. 제2전공 학과에 문의해서 확인해 주세요.",
};

// ---------- 이수 유형(트랙) ----------
// creditSummary      학생에게 보여줄 학점 안내 문구 (학생에게 익숙한 "특수교육 / 표시과목" 용어 사용)
// majorCredits       "특수교육·표시과목 학점" 요건(7번)으로 채워야 하는 학점 (성적표 기준)
// secondMajor        제2전공 요건. 없으면 null
//                    · { credits, ... } → 학생이 입력한 학점으로 판정 (부전공)
//                    · { selfCheck: true } → 학생이 학과에 확인한 뒤 직접 체크 (복수전공)
// studentTeaching    교육실습(학교현장실습·교육봉사) 과목 수와 학점
export const tracks = [
  {
    id: "first-major",
    label: "제1전공심화",
    certificate: "특수학교(중등) 정교사(2급) 직업교육",
    creditSummary: "특수교육 42학점 + 표시과목(직업교육) 39학점 (중복 15학점 제외, 성적표 기준 66학점 이상)",
    usesJobEducation: true,
    majorCredits: 66,
    secondMajor: null,
    studentTeaching: { courses: 2, credits: 4 },
  },
  {
    id: "minor",
    label: "부전공이수",
    certificate: "특수학교(중등) 정교사(2급) '2전공 표시과목'",
    creditSummary: "특수교육 42학점 이상 + 제2전공 표시과목 38학점 이상",
    usesJobEducation: false,
    majorCredits: 42,
    secondMajor: { credits: 38, subjectEducationCredits: 8, basicCredits: 21 },
    studentTeaching: { courses: 2, credits: 4 },
  },
  {
    id: "double-vocational",
    label: "복수전공이수 (직업교육 + 중등 2전공)",
    certificate: "특수학교(중등) 정교사(2급) 직업교육 + 중등학교 정교사(2급) '2전공 표시과목'",
    creditSummary: "특수교육 42학점 + 표시과목(직업교육) 39학점 (성적표 기준 66학점 이상). 제2전공 이수 기준은 해당 학과에 문의",
    usesJobEducation: true,
    majorCredits: 66,
    secondMajor: SECOND_MAJOR_ASK_DEPARTMENT,
    studentTeaching: { courses: 3, credits: 6 }, // 제2전공 교과의 학교현장실습 별도 이수
  },
  {
    id: "double-special",
    label: "복수전공이수 (특수 2전공표시과목 + 중등 표시과목)",
    certificate: "특수학교(중등) 정교사(2급) '2전공 표시과목' + 중등학교 정교사(2급) '표시과목'",
    creditSummary: "제1전공(특수교육) 42학점 이상. 제2전공 이수 기준은 해당 학과에 문의",
    usesJobEducation: false,
    majorCredits: 42,
    secondMajor: SECOND_MAJOR_ASK_DEPARTMENT,
    studentTeaching: { courses: 3, credits: 6 },
  },
];

// ---------- 교직 ----------
// 학교현장실습 과목 수·학점은 이수 유형마다 다르다 (tracks[].studentTeaching).
export const teaching = {
  totalCredits: 22,
  literacyCredits: 6, // 교직소양
  theoryCredits: 12, // 교직이론
};

// ---------- 횟수로 확인하는 기타 필수사항 ----------
// 과목이 아니라 "몇 번 받았는가"를 직접 입력해서 체크한다.
export const countRequirements = [
  { id: "aptitude", label: "교직 적성 및 인성검사", requiredCount: 2 },
  { id: "cpr", label: "응급처치 및 심폐소생술 실습", requiredCount: 2 },
  { id: "genderEducation", label: "성인지교육", requiredCount: 4, note: "연 1회" },
  // blocksCompletion: false → 졸업 요건이지만 마지막 학기에 받는 항목이라, 아직 안 받았어도 "이수"로 판정한다.
  // 대신 warning 문구를 화면에 계속 보여준다.
  {
    id: "drugTest",
    label: "마약류 중독 여부 검사",
    requiredCount: 1,
    note: "마지막 학기",
    blocksCompletion: false,
    warning: "마약류 중독 여부 검사는 마지막 학기에 반드시 받아야 해요. 아직 안 받았어도 이 요건은 이수로 표시됩니다.",
  },
];

// ---------- 졸업요건 안내 페이지 ----------
// 모든 화면 위쪽의 "졸업요건 확인" 버튼이 연결되는 학과 학사정보 페이지
export const GRADUATION_INFO_URL = "https://sped.catholic.ac.kr/sped/course/academic.do";

// ---------- 학과 사무실 연락처 (시작 안내 페이지에 표시) ----------
// 출처: 학과 졸업사정 자가체크 리스트(시트). 바뀌면 여기만 고치면 된다.
export const departmentContact = {
  email: "dpt4610@catholic.ac.kr",
  phone: "02-2164-4490",
};

// ---------- 졸업 인증 (택1) ----------
// 가장 간단하고 추천하는 방법은 한국사 3급 이상이다.
export const graduationCertification = {
  recommended: "koreanHistory",
  options: [
    { id: "koreanHistory", label: "한국사 3급 이상", summary: "대체인정(어학·한국사) 중 하나. 가장 부담이 적어 추천" },
    { id: "language", label: "어학 성적", summary: "TOEIC 700 / TOEFL CBT 200 / TOEFL IBT 80 / TEPS 550 이상 (최근 2년 이내 성적)" },
    { id: "exam", label: "졸업시험", summary: "장애의이해와재활·직업재활개론·전환교육 3과목 평균 60점 이상" },
    { id: "thesis", label: "졸업논문", summary: "지도교수와 상의하여 논문 제출" },
  ],
};

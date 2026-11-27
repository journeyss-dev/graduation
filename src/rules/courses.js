// ============================================================
// 과목 데이터 (특수교육과 전공 과목 + 교직 과목)
// ------------------------------------------------------------
// 출처: 기존 zip 프로젝트의 MajorElective.json / TeacherEducationCourses.json
//       + 졸업사정 자가체크 리스트(스프레드시트)로 대조·보완
//
// [전공 과목 필드 설명]
//   code        과목 코드 (학교 시스템 코드, 사용자 체크 저장 시 이 값을 키로 쓴다)
//   name        과목명
//   credits     학점
//   term        권장 이수 시기 "학년-학기"
//   area        어느 전공에 속하는 과목인가: "special"(특수교육) | "job"(직업교육) | "both"(둘 다)
//   group       영역 안에서의 분류
//                 basic            기본이수과목
//                 subjectEducation 교과교육영역 (직업교육 표시과목)
//                 curriculum       교육과정영역 (직업교육 표시과목, 21학번부터 필수)
//                 general          그 외 일반 과목
//   canDuplicate  true면 "중복 인정" 가능 과목 (직업교육 ↔ 특수교육 양쪽 학점으로 인정, 최대 15학점)
//   required      true면 해당 영역에서 반드시 이수해야 하는 필수 과목
//
// 값이 없는 필드(canDuplicate, required)는 false로 취급한다.
// ============================================================

// ---------- 전공기초 ----------
// 전공기초 9학점 중 필수 1과목. 나머지 6학점은 학생이 직접 입력한다 (requirements.js 참고).
export const majorBasicRequiredCourse = {
  code: "06775",
  name: "장애의이해와재활",
  credits: 3,
  term: "1-1",
};

// ---------- 전공 과목 (특수교육 / 직업교육) ----------
export const majorCourses = [
  // --- 1학년 ---
  { code: "04834", name: "장애학생통합교육론", credits: 3, term: "1-2", area: "special", group: "basic" },
  { code: "06039", name: "지적장애학생교육", credits: 3, term: "1-2", area: "special", group: "basic" },
  { code: "04052", name: "특수교육과재활실습", credits: 3, term: "1-2", area: "special", group: "general" },

  // --- 2학년 ---
  { code: "06044", name: "특수교육대상학생진단및평가", credits: 3, term: "2-1", area: "both", group: "basic", canDuplicate: true }, // 특수교육 or 직업교육 중 택1
  { code: "02424", name: "행동수정", credits: 3, term: "2-1", area: "special", group: "general", canDuplicate: true },
  { code: "02706", name: "직업재활개론", credits: 3, term: "2-1", area: "job", group: "basic", canDuplicate: true },
  { code: "06043", name: "의사소통장애학생교육", credits: 3, term: "2-1", area: "special", group: "basic", canDuplicate: true },
  { code: "06045", name: "특수교육교육과정론", credits: 3, term: "2-1", area: "special", group: "basic", canDuplicate: true, required: true },
  { code: "02723", name: "전환교육", credits: 3, term: "2-2", area: "job", group: "basic", canDuplicate: true },
  { code: "07068", name: "특수교육국어·사회교육과정", credits: 3, term: "2-2", area: "job", group: "curriculum", required: true },
  { code: "06602", name: "재활의학", credits: 3, term: "2-2", area: "special", group: "general", canDuplicate: true },
  { code: "02721", name: "직업재활상담", credits: 3, term: "2-2", area: "job", group: "basic", canDuplicate: true },

  // --- 3학년 ---
  { code: "04836", name: "직업교육교과교육론", credits: 3, term: "3-1", area: "job", group: "subjectEducation", required: true },
  { code: "02712", name: "장애인부모교육및상담", credits: 3, term: "3-1", area: "special", group: "general", canDuplicate: true },
  { code: "06042", name: "학습장애학생교육", credits: 3, term: "3-1", area: "special", group: "basic" },
  { code: "07066", name: "특수교육수학·과학교육과정", credits: 3, term: "3-1", area: "job", group: "curriculum", required: true },
  { code: "02728", name: "지원고용", credits: 3, term: "3-1", area: "job", group: "basic" },
  { code: "06047", name: "정서·행동장애학생교육", credits: 3, term: "3-2", area: "special", group: "basic" },
  { code: "04286", name: "재활행정및정책", credits: 3, term: "3-2", area: "job", group: "basic" },
  { code: "04837", name: "직업교육교과교재연구및지도법", credits: 3, term: "3-2", area: "job", group: "subjectEducation", required: true },
  { code: "04839", name: "직업평가", credits: 3, term: "3-2", area: "job", group: "basic" },
  { code: "07067", name: "특수교육예술·체육교육과정", credits: 3, term: "3-2", area: "job", group: "curriculum", required: true },

  // --- 4학년 ---
  { code: "06048", name: "자폐성장애학생교육", credits: 3, term: "4-1", area: "special", group: "basic" },
  { code: "02727", name: "직업적응훈련", credits: 3, term: "4-1", area: "job", group: "basic" },
  { code: "06878", name: "지체·건강장애학생교육", credits: 3, term: "4-1", area: "special", group: "basic" },
  { code: "04666", name: "직업특수교육지도의논리및윤리", credits: 3, term: "4-1", area: "job", group: "subjectEducation", canDuplicate: true, required: true },
  { code: "05062", name: "재활실습", credits: 3, term: "4-1", area: "job", group: "basic", canDuplicate: true }, // 지도교수님과 상담 필수
  { code: "06828", name: "직무개발과배치", credits: 3, term: "4-1", area: "job", group: "basic" },
  { code: "04287", name: "특수교육재활공학", credits: 3, term: "4-2", area: "special", group: "basic", canDuplicate: true },
  { code: "06046", name: "청각장애학생교육", credits: 3, term: "4-2", area: "special", group: "basic" },
  { code: "06040", name: "시각장애학생교육", credits: 3, term: "4-2", area: "special", group: "basic" }, // 계절학기 개설
  { code: "06049", name: "중도·중복장애학생교육과재활", credits: 3, term: "4-2", area: "special", group: "basic", canDuplicate: true },
  { code: "05061", name: "직업교육과재활연구", credits: 3, term: "4-2", area: "job", group: "general" },
];

// ---------- 교직 과목 ----------
// group
//   literacy  교직소양영역 (6학점 이상)
//   theory    교직이론영역 (12학점 이상)
//   practice  교육실습영역 (제1전공심화·부전공 2과목 4학점 / 복수전공 3과목 6학점)
// required: 반드시 이수해야 하는 교직 필수 과목
// onlyTracks: 이 이수 유형(trackId)을 선택한 경우에만 보이고 인정되는 과목 (없으면 모든 유형)
export const teachingCourses = [
  // --- 교직소양 ---
  { code: "04782", name: "특수교육학개론", credits: 2, term: "1-1", group: "literacy", required: true },
  { code: "06021", name: "학교폭력예방및학생의이해", credits: 2, term: "4-1", group: "literacy", required: true },
  // 교직실무는 원래 2학점이었으나, 디지털교육(1학점)이 신설되면서 1학점으로 줄었다.
  // 교직소양은 6학점만 채우면 되므로, 예전 2학점 과목을 이수한 학생도 체크할 수 있게 둘 다 둔다.
  { code: "04718", name: "교직실무(특수교육) (2학점)", credits: 2, term: "4-1", group: "literacy" }, // 이전 학번 이수자용
  { code: "07160", name: "교직실무(특수교육) (1학점)", credits: 1, term: "4-1", group: "literacy" }, // 현행
  { code: "07161", name: "디지털교육", credits: 1, group: "literacy", required: true },

  // --- 교직이론 ---
  { code: "00127", name: "교육학개론", credits: 3, group: "theory" },
  { code: "00125", name: "교육심리", credits: 2, group: "theory" },
  { code: "00123", name: "교육사회", credits: 2, group: "theory" },
  { code: "00122", name: "교육방법및교육공학", credits: 2, group: "theory" },
  { code: "04717", name: "교육평가", credits: 2, group: "theory" },
  { code: "00126", name: "교육철학및교육사", credits: 2, group: "theory" },
  { code: "00128", name: "교육행정및교육경영", credits: 2, group: "theory" },
  { code: "04781", name: "생활지도및상담", credits: 2, group: "theory" },
  { code: "04712", name: "교육과정", credits: 2, group: "theory" },

  // --- 교육실습 ---
  { code: "04714", name: "교육봉사활동", credits: 2, term: "3-2", group: "practice", required: true },
  { code: "04735", name: "학교현장실습(특수교육)", credits: 2, term: "4-1", group: "practice", required: true },
  // 복수전공(교직 복수): 제2전공 교과의 현장실습. 4-1·4-2학기 모두 가능해서 "4학년"으로만 표시한다.
  { code: "05699", name: "학교현장실습", credits: 2, term: "4학년", group: "practice", onlyTracks: ["double-vocational", "double-special"] },
];

// 둘 중 하나만 선택할 수 있는 교직 과목 묶음 (시트 비고: "하나만 체크")
export const teachingExclusiveGroups = [["04718", "07160"]];

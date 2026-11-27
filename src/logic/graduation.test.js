// ============================================================
// 졸업 판정 로직 테스트
// 실행: npm.cmd test
// 화면 없이 "이렇게 체크하면 이렇게 판정되어야 한다"를 자동으로 확인한다.
// ============================================================

import { test } from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "./studentState.js";
import { evaluateGraduation } from "./evaluateGraduation.js";

// ----- 테스트용 과목 코드 묶음 -----
// 직업교육 표시과목 39학점: 기본이수 7 + 교과교육 3 + 교육과정 3 (13과목)
const JOB_COURSES = [
  "02706", "02723", "02721", "05062", // 직업재활개론, 전환교육, 직업재활상담, 재활실습 (중복 대상)
  "02728", "04286", "04839", // 지원고용, 재활행정및정책, 직업평가
  "04836", "04837", "04666", // 교과교육론, 교재연구및지도법, 논리및윤리(중복 대상)
  "07068", "07066", "07067", // 교육과정영역 3과목
];

// 특수교육 쪽에서 직접 이수하는 9과목 (기본이수 9과목, 필수인 교육과정론 포함)
const SPECIAL_COURSES = [
  "06039", "04834", "06045", "06043", "06042", "06047", "06048", "06046", "06040",
];

// 교직: 소양 6학점 + 이론 13학점 + 교육실습 2과목
const TEACHING_COURSES = [
  "04782", "06021", "07161", "07160", // 소양: 2 + 2 + 1 + 1 = 6학점
  "00127", "00125", "00123", "00122", "04717", "00126", // 이론: 3 + 2×5 = 13학점
  "04714", "04735", // 교육실습: 교육봉사활동, 학교현장실습(특수교육)
];

// 코드 목록을 체크한 상태를 만든다.
function stateWithChecked(codes, year = 2023, trackId = "first-major") {
  const state = createInitialState(year, trackId);
  for (const code of codes) state.checkedCourses[code] = true;
  return state;
}

// 결과에서 요건 하나를 id로 찾는다.
function findRequirement(result, id) {
  return result.requirements.find((requirement) => requirement.id === id);
}

// ---------- 전체 ----------

test("아무것도 입력하지 않으면 완료된 요건이 없다", () => {
  const result = evaluateGraduation(createInitialState(2023));
  assert.equal(result.completedCount, 0);
  assert.equal(result.allCompleted, false);
});

// ---------- 전공: 중복 인정 ----------

test("제1전공심화: 직업 13과목 + 특수 9과목을 체크하면 성적표 66학점이 된다", () => {
  const result = evaluateGraduation(stateWithChecked([...JOB_COURSES, ...SPECIAL_COURSES]));

  const special = findRequirement(result, "specialEducation");
  const job = findRequirement(result, "subjectArea");
  const majorCredits = findRequirement(result, "majorCredits");

  assert.equal(job.completed, true, "직업교육 39학점 충족");
  assert.equal(special.completed, true, "직업 중복 5과목 + 특수 9과목 = 14과목 42학점");
  assert.equal(special.detail.totalCredits, 42);
  assert.equal(majorCredits.detail.duplicatedCredits, 15);
  assert.equal(majorCredits.detail.transcriptCredits, 66);
  assert.equal(majorCredits.completed, true);
});

test("필수 과목(특수교육교육과정론)을 빼면 특수교육이 미완료이다", () => {
  const codes = [...JOB_COURSES, ...SPECIAL_COURSES.filter((code) => code !== "06045")];
  const special = findRequirement(evaluateGraduation(stateWithChecked(codes)), "specialEducation");

  assert.equal(special.completed, false);
  assert.deepEqual(special.detail.missingRequired, ["특수교육교육과정론"]);
});

test("중복 인정은 5과목·15학점을 넘으면 초과로 분류된다", () => {
  const state = stateWithChecked([...JOB_COURSES, ...SPECIAL_COURSES, "02424"]); // 행동수정 추가
  state.alsoCountedInJob["02424"] = true; // 직업교육 쪽에도 인정 요청 → 이미 5과목이라 초과

  const { duplication } = evaluateGraduation(state);
  assert.equal(duplication.accepted.length, 5);
  assert.equal(duplication.credits, 15);
  assert.equal(duplication.overflow.length, 1);
  assert.equal(duplication.overflow[0].course.name, "행동수정");
});

test("진단평가는 선택한 쪽의 기본이수로만 인정된다", () => {
  const special = (state) => findRequirement(evaluateGraduation(state), "specialEducation").detail;
  const job = (state) => findRequirement(evaluateGraduation(state), "subjectArea").detail;

  const toSpecial = stateWithChecked(["06044"]);
  toSpecial.diagnosisAssignedTo = "special";
  assert.equal(special(toSpecial).basicCourseCount, 1);
  assert.equal(job(toSpecial).basicCourseCount, 0);

  const toJob = stateWithChecked(["06044"]);
  toJob.diagnosisAssignedTo = "job";
  assert.equal(special(toJob).basicCourseCount, 0);
  assert.equal(job(toJob).basicCourseCount, 1);
});

test("진단평가를 직업교육에서 선택하면 특수교육에는 자동 인정(중복)으로만 들어간다", () => {
  const state = stateWithChecked(["06044"]);
  state.diagnosisAssignedTo = "job";

  const result = evaluateGraduation(state);
  const special = findRequirement(result, "specialEducation").detail;

  assert.equal(special.basicCourseCount, 0, "특수교육 기본이수로는 세지 않는다");
  assert.equal(special.courseCount, 1, "특수교육 전체 과목에는 자동 인정으로 들어온다");
  assert.equal(result.duplication.accepted.length, 1);
  assert.equal(result.duplication.accepted[0].alsoCountedIn, "special");
});

test("진단평가를 특수교육 기본이수로 선택하면 직업교육·중복 인정에는 들어가지 않는다", () => {
  const state = stateWithChecked(["06044"]);
  state.diagnosisAssignedTo = "special";
  state.alsoCountedInJob["06044"] = true; // 실수로 요청해도 무시되어야 한다

  const result = evaluateGraduation(state);
  assert.equal(findRequirement(result, "subjectArea").detail.courseCount ?? 0, 0);
  assert.equal(findRequirement(result, "subjectArea").detail.totalCredits, 0);
  assert.equal(result.duplication.accepted.length, 0);
});

test("부전공: 직업교육 과목은 무시하고, 제2전공 학점 입력으로 표시과목을 판정한다", () => {
  const state = stateWithChecked([...JOB_COURSES, ...SPECIAL_COURSES], 2023, "minor");
  state.secondMajorCredits = { basic: 21, subjectEducation: 8, total: 38 };

  const result = evaluateGraduation(state);
  assert.equal(findRequirement(result, "subjectArea").completed, true);
  assert.equal(findRequirement(result, "specialEducation").detail.courseCount, 9, "직업 과목은 세지 않는다");
});

test("복수전공(직업교육): 제2전공은 학점 기준 없이 학생이 학과에 확인한 뒤 직접 체크한다", () => {
  const state = stateWithChecked([...JOB_COURSES, ...SPECIAL_COURSES], 2023, "double-vocational");

  const before = evaluateGraduation(state);
  assert.equal(findRequirement(before, "majorCredits").completed, true, "전공 학점은 제2전공과 무관하게 판정");
  assert.equal(findRequirement(before, "secondMajor").completed, false);

  state.secondMajorConfirmed = true;
  assert.equal(findRequirement(evaluateGraduation(state), "secondMajor").completed, true);
});

test("복수전공(특수 2전공표시과목): 표시과목 요건이 제2전공 직접 체크로 판정된다", () => {
  const state = stateWithChecked(SPECIAL_COURSES, 2023, "double-special");
  assert.equal(findRequirement(evaluateGraduation(state), "subjectArea").completed, false);

  state.secondMajorConfirmed = true;
  assert.equal(findRequirement(evaluateGraduation(state), "subjectArea").completed, true);
});

test("제1전공심화에는 제2전공 요건이 없다", () => {
  const result = evaluateGraduation(createInitialState(2023, "first-major"));
  assert.equal(findRequirement(result, "secondMajor"), undefined);
  assert.equal(result.requirements.length, 9);
});

// ---------- 교양 ----------

test("기초교양: 입학년도 기본 목록을 모두 체크하면 완료, 하나라도 빠지면 미완료", () => {
  const state = createInitialState(2024);
  state.basicLiberal.checked = { 인간학1: true, 인간학2: true, 그리스도교사상과문화: true, 키스톤디자인: true };
  assert.equal(findRequirement(evaluateGraduation(state), "basicLiberal").completed, false);

  state.basicLiberal.checked["사랑나누기"] = true;
  assert.equal(findRequirement(evaluateGraduation(state), "basicLiberal").completed, true);
});

test("기초교양: 학생이 고친 목록 기준으로 판정한다", () => {
  const state = createInitialState(2024);
  state.basicLiberal.customCourses = [{ name: "내가추가한과목", credits: 2 }];
  state.basicLiberal.checked = { 내가추가한과목: true };

  const basic = findRequirement(evaluateGraduation(state), "basicLiberal");
  assert.equal(basic.completed, true);
  assert.equal(basic.detail.requiredCredits, 2);
});

test("중핵교양 2025학번: 4개 영역을 1과목씩 채워도 18학점이 안 되면 미완료, 남는 학점은 아무 영역이나 가능", () => {
  const state = createInitialState(2025);
  const areas = ["인문·사회", "자연·과학", "휴먼·테크", "글로벌·외국어"];
  state.coreLiberalCourses = areas.map((area) => ({ area, credits: 3 })); // 12학점
  assert.equal(findRequirement(evaluateGraduation(state), "coreLiberal").completed, false);

  state.coreLiberalCourses.push({ area: "인문·사회", credits: 3 }, { area: "인문·사회", credits: 3 }); // 18학점
  assert.equal(findRequirement(evaluateGraduation(state), "coreLiberal").completed, true);
});

test("중핵교양 2025학번: 18학점이어도 한 영역이 비어 있으면 미완료", () => {
  const state = createInitialState(2025);
  state.coreLiberalCourses = Array.from({ length: 6 }, () => ({ area: "인문·사회", credits: 3 }));
  assert.equal(findRequirement(evaluateGraduation(state), "coreLiberal").completed, false);
});

test("중핵교양 2024학번: 글로벌·외국어는 5학점 이상(실제 6학점)이어야 한다", () => {
  const otherAreas = ["DESIGN", "인문·사회", "자연·과학", "휴먼·테크"];
  const state = createInitialState(2024);
  state.coreLiberalCourses = otherAreas.map((area) => ({ area, credits: 3 }));

  state.coreLiberalCourses.push({ area: "글로벌·외국어", credits: 3 }); // 15학점, 외국어 3학점
  assert.equal(findRequirement(evaluateGraduation(state), "coreLiberal").completed, false);

  state.coreLiberalCourses.push({ area: "글로벌·외국어", credits: 3 }); // 18학점, 외국어 6학점
  assert.equal(findRequirement(evaluateGraduation(state), "coreLiberal").completed, true);
});

test("기준이 등록되지 않은 새 학번(2030)은 가장 최근 기준(2026)으로 판정한다", () => {
  const state = createInitialState(2030);
  const coreRule = findRequirement(evaluateGraduation(state), "coreLiberal").detail;
  const basicRule = findRequirement(evaluateGraduation(state), "basicLiberal").detail;

  assert.equal(coreRule.requiredCredits, 18);
  assert.equal(basicRule.requiredCredits, 11);
});

test("전공기초: 필수 과목 + 사회과학 3학점 + 사회과학 외 3학점이 모두 있어야 한다", () => {
  const state = stateWithChecked(["06775"]);
  state.majorBasicFreeCredits = { social: 3, nonSocial: 0 };
  assert.equal(findRequirement(evaluateGraduation(state), "majorBasic").completed, false);

  state.majorBasicFreeCredits.nonSocial = 3;
  assert.equal(findRequirement(evaluateGraduation(state), "majorBasic").completed, true);
});

// ---------- 교직 ----------

test("교직: 소양 6 + 이론 12 + 실습 2과목 + 횟수 요건을 채우면 완료", () => {
  const state = stateWithChecked(TEACHING_COURSES);
  state.counts = { aptitude: 2, cpr: 2, genderEducation: 4, drugTest: 1 };

  const teaching = findRequirement(evaluateGraduation(state), "teaching");
  assert.equal(teaching.completed, true);
  assert.equal(teaching.detail.totalCredits, 6 + 13 + 4);
});

test("교직: 마약류 검사는 마지막 학기에 받으므로 0회여도 이수로 판정한다", () => {
  const state = stateWithChecked(TEACHING_COURSES);
  state.counts = { aptitude: 2, cpr: 2, genderEducation: 4, drugTest: 0 };

  const teaching = findRequirement(evaluateGraduation(state), "teaching");
  assert.equal(teaching.completed, true);
  assert.equal(teaching.detail.counts.items.find((item) => item.id === "drugTest").completed, false);
});

test("교직: 횟수 요건이 부족하면 미완료", () => {
  const state = stateWithChecked(TEACHING_COURSES);
  state.counts = { aptitude: 1, cpr: 2, genderEducation: 4, drugTest: 1 };
  assert.equal(findRequirement(evaluateGraduation(state), "teaching").completed, false);
});

test("교직실무 두 과목을 모두 체크하면 하나만 인정하고 충돌로 알려준다", () => {
  const state = stateWithChecked(["04718", "07160"]);
  const teaching = findRequirement(evaluateGraduation(state), "teaching").detail;

  assert.equal(teaching.literacyCredits, 2, "먼저 체크된 교직실무(2학점)만 인정");
  assert.deepEqual(teaching.conflicts, ["교직실무(특수교육)"]);
});

test("복수전공은 교육실습이 3과목 6학점 필요하다", () => {
  const state = stateWithChecked(TEACHING_COURSES, 2023, "double-vocational");
  state.counts = { aptitude: 2, cpr: 2, genderEducation: 4, drugTest: 1 };
  assert.equal(findRequirement(evaluateGraduation(state), "teaching").completed, false);

  state.checkedCourses["05699"] = true; // 학교현장실습(제2전공)
  assert.equal(findRequirement(evaluateGraduation(state), "teaching").completed, true);
});

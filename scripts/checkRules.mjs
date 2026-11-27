// ============================================================
// 규칙 데이터 점검 스크립트
// 실행: npm.cmd run check:rules
// 데이터 파일(src/rules/*)을 고친 뒤 숫자가 서로 맞는지 자동으로 확인한다.
// ============================================================

import { majorCourses, teachingCourses } from "../src/rules/courses.js";
import { basicLiberalArts, coreLiberalArts } from "../src/rules/liberalArts.js";
import { specialEducation, jobEducation, teaching, tracks } from "../src/rules/requirements.js";

let failureCount = 0;

// 조건이 맞으면 ✓, 틀리면 ✗ 를 출력하고 실패 횟수를 센다.
function check(description, isOk) {
  console.log(`${isOk ? "✓" : "✗"} ${description}`);
  if (!isOk) failureCount += 1;
}

// 학점 합계를 구한다.
const sumCredits = (courses) => courses.reduce((sum, course) => sum + course.credits, 0);

// ----- 과목 코드 -----
const allCodes = [...majorCourses, ...teachingCourses].map((course) => course.code);
check("과목 코드에 중복이 없다", new Set(allCodes).size === allCodes.length);

// ----- 특수교육 영역 -----
const specialBasic = majorCourses.filter(
  (c) => (c.area === "special" || c.area === "both") && c.group === "basic",
);
check(
  `특수교육 기본이수 과목(${specialBasic.length}과목)이 필요 과목 수(${specialEducation.basicCourses}) 이상이다`,
  specialBasic.length >= specialEducation.basicCourses,
);

// ----- 직업교육 영역 -----
const jobBasic = majorCourses.filter(
  (c) => (c.area === "job" || c.area === "both") && c.group === "basic",
);
check(
  `직업교육 기본이수 과목(${jobBasic.length}과목)이 필요 과목 수(${jobEducation.basicCourses}) 이상이다`,
  jobBasic.length >= jobEducation.basicCourses,
);

const subjectEducation = majorCourses.filter((c) => c.group === "subjectEducation");
const curriculum = majorCourses.filter((c) => c.group === "curriculum");
check(
  "교과교육영역 과목 학점 합계가 기준과 같다",
  sumCredits(subjectEducation) === jobEducation.subjectEducationCredits,
);
check(
  "교육과정영역 과목 학점 합계가 기준과 같다",
  sumCredits(curriculum) === jobEducation.curriculumCredits,
);
check(
  "직업교육 39학점 = 기본이수 + 교과교육 + 교육과정",
  jobEducation.basicCredits + jobEducation.subjectEducationCredits + jobEducation.curriculumCredits ===
    jobEducation.totalCredits,
);

// ----- 이수 유형 -----
const firstMajor = tracks.find((track) => track.id === "first-major");
check(
  "제1전공심화: 특수교육 42 + 직업교육 39 − 중복 15 = 66학점",
  specialEducation.totalCredits + jobEducation.totalCredits - 15 === firstMajor.majorCredits,
);

// ----- 교직 -----
const literacy = teachingCourses.filter((c) => c.group === "literacy");
const theory = teachingCourses.filter((c) => c.group === "theory");
check("교직소양 과목 학점이 기준(6) 이상이다", sumCredits(literacy) >= teaching.literacyCredits);
check("교직이론 과목 학점이 기준(12) 이상이다", sumCredits(theory) >= teaching.theoryCredits);

// ----- 교양 -----
for (const [year, data] of Object.entries(basicLiberalArts)) {
  check(`${year}학번 기초교양: 과목 학점 합계 = 총 학점(${data.totalCredits})`, sumCredits(data.courses) === data.totalCredits);
}
for (const [year, data] of Object.entries(coreLiberalArts)) {
  // 영역별 최소 학점의 합이 총 학점을 넘으면 데이터 오류다. (남는 학점은 자유롭게 채운다)
  const minCreditsSum = data.areas.reduce((sum, area) => sum + area.minCredits, 0);
  check(
    `${year}학번 중핵교양: 영역 최소 학점 합(${minCreditsSum}) ≤ 총 학점(${data.totalCredits})`,
    minCreditsSum <= data.totalCredits,
  );
}

console.log(failureCount === 0 ? "\n모두 통과" : `\n실패 ${failureCount}건`);
process.exit(failureCount === 0 ? 0 : 1);

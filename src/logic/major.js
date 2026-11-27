// ============================================================
// 전공 요건 판정: 특수교육(6) · 표시과목/직업교육(5) · 전공학점(7)
// ------------------------------------------------------------
// 이 세 요건은 "중복 인정" 때문에 서로 얽혀 있어서 한 파일에서 함께 계산한다.
//
// [중복 인정이란?]
//   직업교육(표시과목) 39학점과 특수교육 42학점을 합치면 81학점이지만,
//   양쪽에서 동시에 인정되는 과목(최대 5과목 15학점)이 있어서
//   성적표에 실제로 쌓이는 학점은 81 - 15 = 66학점이 된다.
// ============================================================

import { majorCourses } from "../rules/courses.js";
import { specialEducation, jobEducation, duplication } from "../rules/requirements.js";
import { getTrack, sumCredits } from "./utils.js";

// "특수교육대상학생진단및평가": 특수교육/직업교육 기본이수 중 한쪽을 골라서 이수하는 특별 과목
//  - 특수교육 기본이수로 선택 → 특수교육에서만 인정 (직업교육에는 들어가지 않음)
//  - 직업교육 기본이수로 선택 → 직업교육 기본이수 + 특수교육에는 "자동 인정된 과목"(중복 인정)으로 들어감
export const DIAGNOSIS_CODE = "06044";

// ===== 1. 체크한 과목을 특수교육 쪽 / 직업교육 쪽으로 나누기 =====

// 과목이 원래 어느 쪽 요건에 속하는지 정한다.
// - area가 "both"인 과목(진단평가)은 학생이 고른 쪽에 속한다.
// - 직업교육을 쓰지 않는 이수 유형(부전공 등)에서는 항상 특수교육 쪽이다.
function decideOwnSide(course, state, track) {
  if (course.area !== "both") return course.area;
  return track.usesJobEducation ? state.diagnosisAssignedTo : "special";
}

// 학생이 체크한 전공 과목을 두 쪽으로 나누고, 중복 인정 과목을 반대쪽에도 넣어 준다.
// - state: 학생 입력 상태
// - 반환: { specialSide, jobSide, duplication: { accepted, overflow, credits } }
//     specialSide / jobSide : 각 요건에서 인정되는 과목 목록 (중복 인정 포함)
//     duplication.accepted  : 중복으로 인정된 과목, overflow: 한도(5과목·15학점) 초과로 제외된 과목
export function sortIntoSides(state) {
  const track = getTrack(state.trackId);
  const specialSide = [];
  const jobSide = [];

  // 체크한 과목을 원래 속한 쪽에 넣는다. 이수 유형에 맞지 않는 쪽(직업교육 미사용)은 건너뛴다.
  for (const course of majorCourses) {
    if (!state.checkedCourses[course.code]) continue;

    const ownSide = decideOwnSide(course, state, track);
    if (ownSide === "job" && !track.usesJobEducation) continue;

    if (ownSide === "special") specialSide.push(course);
    else jobSide.push(course);
  }

  // 중복 인정 후보를 모은다.
  //  - 직업교육 과목: 중복 대상이면 특수교육에도 자동으로 인정
  //    (진단평가를 직업교육에서 선택했다면 이 경우에 해당한다)
  //  - 특수교육 과목: 중복 대상이고 학생이 직접 고른 경우에만 직업교육에도 인정
  //    (진단평가를 특수교육 기본이수로 선택했다면 직업교육에는 들어가지 않는다)
  const candidates = [];
  if (track.usesJobEducation) {
    for (const course of jobSide) {
      if (course.canDuplicate) {
        candidates.push({ course, alsoCountedIn: "special" });
      }
    }
    for (const course of specialSide) {
      const chosenByStudent = state.alsoCountedInJob[course.code] === true;
      if (course.canDuplicate && course.code !== DIAGNOSIS_CODE && chosenByStudent) {
        candidates.push({ course, alsoCountedIn: "job" });
      }
    }
  }

  // 후보를 순서대로 인정하되, 5과목·15학점 한도를 넘으면 초과로 분류한다.
  const accepted = [];
  const overflow = [];
  let acceptedCredits = 0;

  for (const candidate of candidates) {
    const isWithinCourseLimit = accepted.length < duplication.maxCourses;
    const isWithinCreditLimit = acceptedCredits + candidate.course.credits <= duplication.maxCredits;

    if (!isWithinCourseLimit || !isWithinCreditLimit) {
      overflow.push(candidate);
      continue;
    }

    accepted.push(candidate);
    acceptedCredits += candidate.course.credits;
    if (candidate.alsoCountedIn === "special") specialSide.push(candidate.course);
    else jobSide.push(candidate.course);
  }

  return { specialSide, jobSide, duplication: { accepted, overflow, credits: acceptedCredits } };
}

// 과목이 해당 쪽(side)의 "기본이수과목"으로 인정되는지 확인한다.
// - 중복 인정으로 반대쪽에 들어온 과목은 area가 달라서 기본이수로 세지 않는다.
// - 진단평가(area가 both)는 학생이 선택한 쪽에서만 기본이수이다.
//   직업교육에서 선택했다면 특수교육에는 "자동 인정된 과목"으로만 들어가고 기본이수로는 세지 않는다.
export function isBasicCourse(course, side, state) {
  if (course.group !== "basic") return false;
  if (course.area === "both") return decideOwnSide(course, state, getTrack(state.trackId)) === side;
  return course.area === side;
}

// 필수 과목 중 아직 체크하지 않은 과목의 이름 목록을 구한다.
function findMissingRequiredNames(state, side) {
  return majorCourses
    .filter((course) => course.required && course.area === side && !state.checkedCourses[course.code])
    .map((course) => course.name);
}

// ===== 2. 요건 6: 특수교육 =====

// 특수교육 요건을 판정한다. (기본이수 7과목 21학점 + 전체 14과목 42학점 + 필수 과목)
export function evaluateSpecialEducation(state, sides) {
  const courses = sides.specialSide;
  const basicCourses = courses.filter((course) => isBasicCourse(course, "special", state));
  const missingRequired = findMissingRequiredNames(state, "special");

  const basicCredits = sumCredits(basicCourses);
  const totalCredits = sumCredits(courses);

  const completed =
    basicCourses.length >= specialEducation.basicCourses &&
    basicCredits >= specialEducation.basicCredits &&
    courses.length >= specialEducation.totalCourses &&
    totalCredits >= specialEducation.totalCredits &&
    missingRequired.length === 0;

  return {
    completed,
    basicCourseCount: basicCourses.length,
    basicCredits,
    courseCount: courses.length,
    totalCredits,
    missingRequired,
  };
}

// ===== 3. 요건 5: 표시과목(직업교육) =====

// 직업교육 표시과목 요건을 판정한다.
// (기본이수 7과목 21학점 + 교과교육 9학점 + 교육과정 9학점 + 합계 39학점 + 필수 과목)
// 직업교육을 쓰지 않는 이수 유형이면 null을 돌려준다. (제2전공 요건은 아래 evaluateSecondMajor)
export function evaluateJobEducation(state, sides) {
  const track = getTrack(state.trackId);
  if (!track.usesJobEducation) return null;

  const courses = sides.jobSide;
  const basicCourses = courses.filter((course) => isBasicCourse(course, "job", state));
  const subjectEducationCredits = sumCredits(courses.filter((c) => c.group === "subjectEducation"));
  const curriculumCredits = sumCredits(courses.filter((c) => c.group === "curriculum"));
  const missingRequired = findMissingRequiredNames(state, "job");

  const basicCredits = sumCredits(basicCourses);
  const totalCredits = sumCredits(courses);

  const completed =
    basicCourses.length >= jobEducation.basicCourses &&
    basicCredits >= jobEducation.basicCredits &&
    subjectEducationCredits >= jobEducation.subjectEducationCredits &&
    curriculumCredits >= jobEducation.curriculumCredits &&
    totalCredits >= jobEducation.totalCredits &&
    missingRequired.length === 0;

  return {
    completed,
    basicCourseCount: basicCourses.length,
    basicCredits,
    subjectEducationCredits,
    curriculumCredits,
    totalCredits,
    missingRequired,
  };
}

// ===== 4. 제2전공(표시과목) =====

// 제2전공 요건을 판정한다. 제2전공은 다른 학과 과목이라 과목 체크를 쓰지 않는다.
//  - 복수전공(selfCheck): 이수 기준이 학과마다 달라서, 학생이 학과에 확인한 뒤 직접 체크한 값을 그대로 쓴다.
//  - 부전공: 학생이 입력한 제2전공 학점을 기준과 비교한다.
// 제2전공이 없는 이수 유형(제1전공심화)이면 null을 돌려준다.
export function evaluateSecondMajor(state) {
  const track = getTrack(state.trackId);
  if (!track.secondMajor) return null;

  if (track.secondMajor.selfCheck) {
    return { completed: state.secondMajorConfirmed === true, selfCheck: true, notice: track.secondMajor.notice };
  }

  const required = track.secondMajor;
  const entered = state.secondMajorCredits;

  const completed =
    entered.total >= required.credits &&
    entered.subjectEducation >= required.subjectEducationCredits &&
    entered.basic >= required.basicCredits;

  return { completed, required, entered };
}

// ===== 5. 요건 7: 전공 학점 =====

// 성적표에 쌓이는 전공 학점이 이수 유형 기준 이상인지 판정한다.
// 중복 인정 과목은 두 쪽에 모두 들어 있지만 성적표에는 한 번만 쌓이므로, 과목 코드 기준으로 합친다.
export function evaluateMajorCredits(state, sides) {
  const track = getTrack(state.trackId);

  const uniqueCourses = new Map();
  for (const course of [...sides.specialSide, ...sides.jobSide]) {
    uniqueCourses.set(course.code, course);
  }
  const transcriptCredits = sumCredits([...uniqueCourses.values()]);

  return {
    completed: transcriptCredits >= track.majorCredits,
    transcriptCredits,
    requiredCredits: track.majorCredits,
    duplicatedCredits: sides.duplication.credits,
  };
}

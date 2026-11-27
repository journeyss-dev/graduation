// ============================================================
// 교직과정 요건 판정 (요건 8)
// 교직소양 6학점 + 교직이론 12학점 + 교육실습 + 횟수 요건(적성검사, 심폐소생술 등)
// ============================================================

import { teachingCourses, teachingExclusiveGroups } from "../rules/courses.js";
import { teaching, countRequirements } from "../rules/requirements.js";
import { getTrack, sumCredits } from "./utils.js";

// 체크한 교직 과목 중 "둘 중 하나만 인정" 묶음(교직실무)에서 중복 체크된 것을 걸러낸다.
// 묶음 안에서 가장 먼저 체크된 과목만 인정하고, 나머지는 conflicts에 담는다.
function pickCountedCourses(state) {
  const checked = teachingCourses.filter((course) => state.checkedCourses[course.code]);
  const conflicts = [];

  const counted = checked.filter((course) => {
    const group = teachingExclusiveGroups.find((codes) => codes.includes(course.code));
    if (!group) return true;

    const firstCheckedCode = group.find((code) => state.checkedCourses[code]);
    if (firstCheckedCode === course.code) return true;

    conflicts.push(course.name);
    return false;
  });

  return { counted, conflicts };
}

// 횟수 요건(적성검사 2회 등)을 판정한다. 학생이 입력한 횟수가 필요 횟수 이상이면 통과.
// 마지막 학기에 받는 항목(blocksCompletion: false)은 아직 안 받았어도 전체 판정에서 제외한다.
export function evaluateCountRequirements(state) {
  const items = countRequirements.map((item) => {
    const count = state.counts[item.id] ?? 0;
    return {
      id: item.id,
      label: item.label,
      requiredCount: item.requiredCount,
      count,
      completed: count >= item.requiredCount,
      blocksCompletion: item.blocksCompletion !== false,
    };
  });

  const completed = items.filter((item) => item.blocksCompletion).every((item) => item.completed);
  return { completed, items };
}

// 교직과정 전체를 판정한다.
export function evaluateTeaching(state) {
  const track = getTrack(state.trackId);
  const { counted, conflicts } = pickCountedCourses(state);

  const literacy = counted.filter((course) => course.group === "literacy");
  const theory = counted.filter((course) => course.group === "theory");
  const practice = counted.filter((course) => course.group === "practice");

  // 필수 교직 과목(특수교육학개론, 학교폭력예방 등) 중 아직 체크하지 않은 것
  const missingRequired = teachingCourses
    .filter((course) => course.required && !state.checkedCourses[course.code])
    .map((course) => course.name);

  const literacyCredits = sumCredits(literacy);
  const theoryCredits = sumCredits(theory);
  const practiceCredits = sumCredits(practice);
  const totalCredits = literacyCredits + theoryCredits + practiceCredits;

  const needed = track.studentTeaching; // 교육실습 과목 수·학점 (이수 유형별로 다름)
  const countResult = evaluateCountRequirements(state);

  const completed =
    literacyCredits >= teaching.literacyCredits &&
    theoryCredits >= teaching.theoryCredits &&
    practice.length >= needed.courses &&
    practiceCredits >= needed.credits &&
    totalCredits >= teaching.totalCredits &&
    missingRequired.length === 0 &&
    countResult.completed;

  return {
    completed,
    literacyCredits,
    theoryCredits,
    practiceCourseCount: practice.length,
    practiceCredits,
    totalCredits,
    requiredPractice: needed,
    missingRequired,
    conflicts,
    counts: countResult,
  };
}

// ============================================================
// 교양·전공기초 요건 판정: 기초교양(2) · 중핵교양(3) · 전공기초(4)
// ============================================================

import { basicLiberalArts, coreLiberalArts, findRuleForYear } from "../rules/liberalArts.js";
import { majorBasic } from "../rules/requirements.js";
import { majorBasicRequiredCourse } from "../rules/courses.js";

// ===== 요건 2: 기초교양 =====

// 학생이 보게 될 기초교양 과목 목록을 구한다.
// 학생이 직접 고친 목록이 있으면 그것을, 없으면 입학년도 기본 목록을 쓴다.
export function getBasicLiberalCourses(state) {
  if (state.basicLiberal.customCourses !== null) return state.basicLiberal.customCourses;
  return findRuleForYear(basicLiberalArts, state.admissionYear)?.courses ?? [];
}

// 기초교양을 판정한다. 목록의 모든 과목을 체크해야 이수 완료이다.
export function evaluateBasicLiberal(state) {
  const courses = getBasicLiberalCourses(state);
  const checkedCourses = courses.filter((course) => state.basicLiberal.checked[course.name]);

  const requiredCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const earnedCredits = checkedCourses.reduce((sum, course) => sum + course.credits, 0);

  return {
    completed: courses.length > 0 && checkedCourses.length === courses.length,
    requiredCredits,
    earnedCredits,
    missing: courses.filter((course) => !state.basicLiberal.checked[course.name]).map((c) => c.name),
  };
}

// ===== 요건 3: 중핵교양 =====

// 중핵교양을 판정한다.
//  ① 영역마다 최소 학점 이상 이수  ② 전체 합계가 총 학점 이상
// (영역 최소 학점의 합이 총 학점보다 작으면, 남는 학점은 아무 영역에서 채워도 된다.)
export function evaluateCoreLiberal(state) {
  const rule = findRuleForYear(coreLiberalArts, state.admissionYear);
  if (!rule) return { completed: false, areas: [], earnedCredits: 0, requiredCredits: 0 };

  // 영역별 이수 학점 계산
  const areas = rule.areas.map((area) => {
    const earned = state.coreLiberalCourses
      .filter((course) => course.area === area.name)
      .reduce((sum, course) => sum + course.credits, 0);

    return { name: area.name, minCredits: area.minCredits, earned, completed: earned >= area.minCredits };
  });

  // 목록에 없는 영역으로 입력된 과목은 합계에 포함하지 않는다.
  const earnedCredits = areas.reduce((sum, area) => sum + area.earned, 0);

  return {
    completed: areas.every((area) => area.completed) && earnedCredits >= rule.totalCredits,
    areas,
    earnedCredits,
    requiredCredits: rule.totalCredits,
  };
}

// ===== 요건 4: 전공기초 =====

// 전공기초(9학점)를 판정한다.
// 장애의이해와재활(필수) + 사회과학 계열 3학점 + 사회과학 외 계열 3학점
export function evaluateMajorBasic(state) {
  const requiredCourseChecked = state.checkedCourses[majorBasicRequiredCourse.code] === true;

  // 계열별로 필요한 학점을 채웠는지 확인한다.
  const slots = majorBasic.freeSlots.map((slot) => {
    const earned = state.majorBasicFreeCredits[slot.id] ?? 0;
    return { id: slot.id, label: slot.label, requiredCredits: slot.credits, earned, completed: earned >= slot.credits };
  });

  return {
    completed: requiredCourseChecked && slots.every((slot) => slot.completed),
    requiredCourseChecked,
    slots,
  };
}

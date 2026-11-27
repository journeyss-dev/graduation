// ============================================================
// 체크한 과목 내역 (영역별로 정리해서 한눈에 보기 위한 데이터)
// 판정은 하지 않고, 학생이 입력한 것을 영역별 목록으로 모으기만 한다.
// ============================================================

import { majorBasicRequiredCourse, teachingCourses } from "../rules/courses.js";
import { countRequirements, majorBasic } from "../rules/requirements.js";
import { getBasicLiberalCourses } from "./liberalArts.js";
import { isBasicCourse } from "./major.js";
import { getTrack, sumCredits } from "./utils.js";

// 영역 안에서의 분류 이름
const MAJOR_GROUP_LABELS = {
  basic: "기본이수",
  subjectEducation: "교과교육",
  curriculum: "교육과정",
  general: "기타",
};
const TEACHING_GROUP_LABELS = { literacy: "교직소양", theory: "교직이론", practice: "교육실습" };

// 과목 목록에서 "N과목 M학점" 요약 문구를 만든다.
function summarizeCourses(items) {
  const credits = items.reduce((sum, item) => sum + (item.credits ?? 0), 0);
  return `${items.length}과목 ${credits}학점`;
}

// 학생이 체크·입력한 내용을 영역별 목록으로 정리한다.
// - state: 학생 입력 상태, result: evaluateGraduation 결과
// - 반환: [{ id, title, summary, items: [{ name, detail, credits }] }, ...]
export function buildCourseOverview(state, result) {
  const track = getTrack(state.trackId);
  const sections = [];

  // 중복 인정으로 반대쪽에도 들어간 과목 코드 모음 (어느 쪽에서 추가로 인정됐는지)
  const alsoInSpecial = new Set(result.duplication.accepted.filter((a) => a.alsoCountedIn === "special").map((a) => a.course.code));
  const alsoInJob = new Set(result.duplication.accepted.filter((a) => a.alsoCountedIn === "job").map((a) => a.course.code));

  // ----- 기초교양 -----
  const basicItems = getBasicLiberalCourses(state)
    .filter((course) => state.basicLiberal.checked[course.name])
    .map((course) => ({ name: course.name, detail: `${course.credits}학점`, credits: course.credits }));
  sections.push({ id: "basicLiberal", title: "기초교양", summary: summarizeCourses(basicItems), items: basicItems });

  // ----- 중핵교양 -----
  const coreItems = state.coreLiberalCourses.map((course) => ({
    name: course.name || "(과목명 없음)",
    detail: `${course.area} · ${course.credits}학점`,
    credits: course.credits,
  }));
  sections.push({ id: "coreLiberal", title: "중핵교양", summary: summarizeCourses(coreItems), items: coreItems });

  // ----- 전공기초 -----
  const majorBasicItems = [];
  if (state.checkedCourses[majorBasicRequiredCourse.code]) {
    majorBasicItems.push({ name: majorBasicRequiredCourse.name, detail: `${majorBasicRequiredCourse.credits}학점 · 필수`, credits: majorBasicRequiredCourse.credits });
  }
  for (const slot of majorBasic.freeSlots) {
    if ((state.majorBasicFreeCredits[slot.id] ?? 0) >= slot.credits) {
      majorBasicItems.push({ name: `${slot.label} 이수 과목`, detail: `${slot.credits}학점`, credits: slot.credits });
    }
  }
  sections.push({ id: "majorBasic", title: "전공기초", summary: summarizeCourses(majorBasicItems), items: majorBasicItems });

  // ----- 특수교육 -----
  const specialItems = result.sides.specialSide.map((course) => {
    const tags = [];
    if (isBasicCourse(course, "special", state)) tags.push("기본이수");
    if (alsoInSpecial.has(course.code)) tags.push("직업교육 과목에서 자동 인정");
    if (alsoInJob.has(course.code)) tags.push("표시과목에도 인정");
    return { name: course.name, detail: [`${course.credits}학점`, ...tags].join(" · "), credits: course.credits };
  });
  sections.push({ id: "specialEducation", title: "특수교육", summary: summarizeCourses(specialItems), items: specialItems });

  // ----- 표시과목(직업교육) -----
  if (track.usesJobEducation) {
    const jobItems = result.sides.jobSide.map((course) => {
      const tags = [];
      tags.push(alsoInJob.has(course.code) ? "특수교육 과목에서 인정" : MAJOR_GROUP_LABELS[course.group]);
      if (alsoInSpecial.has(course.code)) tags.push("특수교육에도 인정");
      return { name: course.name, detail: [`${course.credits}학점`, ...tags].join(" · "), credits: course.credits };
    });
    sections.push({ id: "subjectArea", title: "표시과목(직업교육)", summary: summarizeCourses(jobItems), items: jobItems });
  }

  // ----- 제2전공 -----
  if (track.secondMajor?.selfCheck) {
    sections.push({
      id: "secondMajor",
      title: "제2전공",
      summary: state.secondMajorConfirmed ? "학과 확인 완료" : "학과 확인 전",
      items: state.secondMajorConfirmed ? [{ name: "제2전공 학과에서 이수 기준 확인", detail: "충족", credits: 0 }] : [],
    });
  } else if (track.secondMajor) {
    const entered = state.secondMajorCredits;
    sections.push({
      id: "secondMajor",
      title: "제2전공(부전공)",
      summary: `전체 ${entered.total}학점`,
      items: [
        { name: "기본이수과목", detail: `${entered.basic}학점`, credits: 0 },
        { name: "교과교육영역", detail: `${entered.subjectEducation}학점`, credits: 0 },
        { name: "제2전공 전체", detail: `${entered.total}학점`, credits: 0 },
      ],
    });
  }

  // ----- 교직 -----
  const teachingItems = teachingCourses
    .filter((course) => state.checkedCourses[course.code])
    .map((course) => ({ name: course.name, detail: `${course.credits}학점 · ${TEACHING_GROUP_LABELS[course.group]}`, credits: course.credits }));
  const countItems = countRequirements.map((rule) => ({
    name: rule.label,
    detail: `${state.counts[rule.id] ?? 0} / ${rule.requiredCount}회`,
    credits: 0,
  }));
  sections.push({
    id: "teaching",
    title: "교직과정",
    summary: `${teachingItems.length}과목 ${sumCredits(teachingItems)}학점`,
    items: [...teachingItems, ...countItems],
  });

  // ----- 기타 -----
  sections.push({
    id: "etc",
    title: "기타",
    summary: "",
    items: [
      { name: "총 이수 학점", detail: `${state.totalCredits}학점`, credits: 0 },
      { name: "졸업 인증", detail: state.certificationPassed ? "통과" : "아직 통과하지 않음", credits: 0 },
    ],
  });

  return sections;
}

// ============================================================
// 졸업 요건 종합 판정
// 학생 입력 상태(studentState) 하나를 받아 모든 요건의 이수 여부를 계산한다.
// 화면은 이 함수의 결과를 그대로 보여주기만 한다.
// ============================================================

import { TOTAL_REQUIRED_CREDITS } from "../rules/requirements.js";
import { getTrack } from "./utils.js";
import {
  sortIntoSides,
  evaluateSpecialEducation,
  evaluateJobEducation,
  evaluateSecondMajor,
  evaluateMajorCredits,
} from "./major.js";
import { evaluateBasicLiberal, evaluateCoreLiberal, evaluateMajorBasic } from "./liberalArts.js";
import { evaluateTeaching } from "./teaching.js";

// 모든 졸업 요건을 판정한다.
// - state: studentState.js 의 createInitialState 로 만든 학생 입력 상태
// - 반환: {
//     requirements: [{ id, title, completed, detail }, ...]  요건 9개 (직업교육 + 복수전공은 10개)
//     completedCount, allCompleted,
//     duplication  중복 인정 결과 (화면에서 한도 초과 경고에 사용)
//     sides        특수교육 / 직업교육 쪽에서 인정된 과목 목록 (체크 내역 보기에 사용)
//   }
export function evaluateGraduation(state) {
  const track = getTrack(state.trackId);
  const sides = sortIntoSides(state);

  // 요건 5 "표시과목": 직업교육 유형은 과목 체크로, 그 외 유형은 제2전공 입력으로 판정한다.
  const jobEducation = evaluateJobEducation(state, sides);
  const secondMajor = evaluateSecondMajor(state);
  const subjectArea = jobEducation ?? secondMajor;

  // 직업교육 + 제2전공(복수전공)이면 표시과목과 별개로 제2전공 요건이 하나 더 필요하다.
  const extraSecondMajorRequirements =
    jobEducation !== null && secondMajor !== null
      ? [{ id: "secondMajor", title: "제2전공 이수 (학과 확인)", ...wrap(secondMajor) }]
      : [];

  const requirements = [
    {
      id: "totalCredits",
      title: `총 이수 학점 ${TOTAL_REQUIRED_CREDITS}학점`,
      completed: state.totalCredits >= TOTAL_REQUIRED_CREDITS,
      detail: { earned: state.totalCredits, required: TOTAL_REQUIRED_CREDITS },
    },
    { id: "basicLiberal", title: "기초교양", ...wrap(evaluateBasicLiberal(state)) },
    { id: "coreLiberal", title: "중핵교양", ...wrap(evaluateCoreLiberal(state)) },
    { id: "majorBasic", title: "전공기초", ...wrap(evaluateMajorBasic(state)) },
    { id: "subjectArea", title: track.usesJobEducation ? "표시과목(직업교육)" : "표시과목(제2전공)", ...wrap(subjectArea) },
    ...extraSecondMajorRequirements,
    { id: "specialEducation", title: "특수교육", ...wrap(evaluateSpecialEducation(state, sides)) },
    {
      id: "majorCredits",
      title: track.usesJobEducation ? "특수교육 + 표시과목 학점" : "특수교육 학점",
      ...wrap(evaluateMajorCredits(state, sides)),
    },
    { id: "teaching", title: "교직과정", ...wrap(evaluateTeaching(state)) },
    {
      id: "certification",
      title: "졸업 인증",
      completed: state.certificationPassed === true,
      detail: {},
    },
  ];

  const completedCount = requirements.filter((requirement) => requirement.completed).length;

  return {
    requirements,
    completedCount,
    allCompleted: completedCount === requirements.length,
    duplication: sides.duplication,
    sides: { specialSide: sides.specialSide, jobSide: sides.jobSide },
  };
}

// 각 판정 함수의 결과(completed 포함)를 { completed, detail } 모양으로 맞춘다.
function wrap(result) {
  return { completed: result.completed, detail: result };
}

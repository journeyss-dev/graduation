// ============================================================
// 요건별 한 줄 요약 문구 (현황 화면에서 요건 이름 아래에 보여준다)
// 예: "기초교양 → 9 / 13학점"
// ============================================================

import { TOTAL_REQUIRED_CREDITS, specialEducation, jobEducation, teaching } from "../rules/requirements.js";

// 요건 하나(evaluateGraduation 결과의 requirements 항목)를 한 줄 문구로 요약한다.
export function summarizeRequirement(requirement) {
  const { id, completed, detail } = requirement;

  switch (id) {
    case "totalCredits":
      return `${detail.earned} / ${TOTAL_REQUIRED_CREDITS}학점`;

    case "basicLiberal":
    case "coreLiberal":
      if (detail.allConfirmed) return "요건을 모두 만족했다고 체크함";
      return `${detail.earnedCredits} / ${detail.requiredCredits}학점`;

    case "majorBasic": {
      const slotText = detail.slots.map((slot) => `${slot.label} ${slot.completed ? "이수" : "미이수"}`);
      const requiredText = detail.requiredCourseChecked ? "필수 과목 이수" : "필수 과목 미이수";
      const secondText = detail.needsSecondMajorBasic ? [`복수전공 ${detail.secondMajorBasicDone ? "이수" : "미이수"}`] : [];
      return [requiredText, ...slotText, ...secondText].join(" · ");
    }

    case "subjectArea":
      return summarizeSubjectArea(detail);

    case "secondMajor":
      return completed ? "학과 확인 완료" : "제2전공 학과에 문의해서 확인해 주세요";

    case "specialEducation":
      return `기본이수 ${detail.basicCourseCount} / ${specialEducation.basicCourses}과목 · 합계 ${detail.totalCredits} / ${specialEducation.totalCredits}학점`;

    case "majorCredits":
      return `성적표 기준 ${detail.transcriptCredits} / ${detail.requiredCredits}학점`;

    case "teaching":
      return `소양 ${detail.literacyCredits}/${teaching.literacyCredits} · 이론 ${detail.theoryCredits}/${teaching.theoryCredits} · 실습 ${detail.practiceCourseCount}/${detail.requiredPractice.courses}과목`;

    case "certification":
      return completed ? "통과" : "아직 통과하지 않음";

    default:
      return "";
  }
}

// ===== 아직 남은 일 =====

// 목표에 못 미치면 "○○ N학점 더 필요" 문구를, 충분하면 null을 돌려준다.
function shortOf(label, value, target, unit) {
  return value < target ? `${label} ${target - value}${unit} 더 필요` : null;
}

// 미이수 요건 하나에 대해 "무엇이 부족한지"를 문장 목록으로 돌려준다. (이수한 요건이면 빈 목록)
export function describeShortfalls(requirement) {
  const { id, completed, detail } = requirement;
  if (completed) return [];

  const lines = [];

  switch (id) {
    case "totalCredits":
      lines.push(shortOf("총 이수 학점", detail.earned, TOTAL_REQUIRED_CREDITS, "학점"));
      break;

    case "basicLiberal":
      if (detail.missing.length > 0) lines.push(`아직 안 들은 과목: ${detail.missing.join(", ")}`);
      else lines.push("기초교양 과목 목록이 비어 있어요");
      break;

    case "coreLiberal": {
      for (const area of detail.areas) lines.push(shortOf(area.name, area.earned, area.minCredits, "학점"));
      // 영역별 최소는 채웠는데 전체 학점이 모자란 경우
      lines.push(shortOf("중핵교양 전체", detail.earnedCredits, detail.requiredCredits, "학점"));
      break;
    }

    case "majorBasic":
      if (!detail.requiredCourseChecked) lines.push("장애의이해와재활 미이수");
      for (const slot of detail.slots) if (!slot.completed) lines.push(`${slot.label} 과목 미이수`);
      if (!detail.secondMajorBasicDone) lines.push("복수전공 전공기초 과목 미이수");
      break;

    case "subjectArea":
    case "secondMajor":
      lines.push(...describeSubjectAreaShortfalls(detail));
      break;

    case "specialEducation":
      if (detail.missingRequired.length > 0) lines.push(`필수 과목 미이수: ${detail.missingRequired.join(", ")}`);
      lines.push(shortOf("기본이수과목", detail.basicCourseCount, specialEducation.basicCourses, "과목"));
      lines.push(shortOf("전체 학점", detail.totalCredits, specialEducation.totalCredits, "학점"));
      break;

    case "majorCredits":
      lines.push(shortOf("성적표 기준 학점", detail.transcriptCredits, detail.requiredCredits, "학점"));
      break;

    case "teaching":
      if (detail.missingRequired.length > 0) lines.push(`필수 과목 미이수: ${detail.missingRequired.join(", ")}`);
      lines.push(shortOf("교직소양", detail.literacyCredits, teaching.literacyCredits, "학점"));
      lines.push(shortOf("교직이론", detail.theoryCredits, teaching.theoryCredits, "학점"));
      lines.push(shortOf("교육실습", detail.practiceCourseCount, detail.requiredPractice.courses, "과목"));
      for (const item of detail.counts.items) {
        if (item.blocksCompletion) lines.push(shortOf(item.label, item.count, item.requiredCount, "회"));
      }
      break;

    case "certification":
      lines.push("졸업 인증(한국사 3급 이상 등) 중 하나를 통과해야 해요");
      break;
  }

  return lines.filter(Boolean);
}

// 표시과목·제2전공 요건의 부족한 점을 이수 유형에 맞게 정리한다.
function describeSubjectAreaShortfalls(detail) {
  if (detail.selfCheck) return ["제2전공 학과에 이수 기준을 확인해 주세요"];

  if (detail.entered) {
    return [
      shortOf("제2전공 기본이수", detail.entered.basic, detail.required.basicCredits, "학점"),
      shortOf("제2전공 교과교육", detail.entered.subjectEducation, detail.required.subjectEducationCredits, "학점"),
      shortOf("제2전공 전체", detail.entered.total, detail.required.credits, "학점"),
    ];
  }

  return [
    detail.missingRequired.length > 0 ? `필수 과목 미이수: ${detail.missingRequired.join(", ")}` : null,
    shortOf("기본이수과목", detail.basicCourseCount, jobEducation.basicCourses, "과목"),
    shortOf("교과교육영역", detail.subjectEducationCredits, jobEducation.subjectEducationCredits, "학점"),
    shortOf("교육과정영역", detail.curriculumCredits, jobEducation.curriculumCredits, "학점"),
    shortOf("표시과목 전체", detail.totalCredits, jobEducation.totalCredits, "학점"),
  ];
}

// 표시과목 요건은 이수 유형에 따라 내용이 달라서 따로 요약한다.
//  - 직업교육: 기본이수 과목 수와 학점 합계
//  - 복수전공(직접 체크): 학과 확인 여부
//  - 부전공: 입력한 제2전공 학점
function summarizeSubjectArea(detail) {
  if (detail.selfCheck) {
    return detail.completed ? "학과 확인 완료" : "제2전공 학과에 문의해서 확인해 주세요";
  }
  if (detail.entered) {
    return `제2전공 ${detail.entered.total} / ${detail.required.credits}학점`;
  }
  return `기본이수 ${detail.basicCourseCount} / ${jobEducation.basicCourses}과목 · 합계 ${detail.totalCredits} / ${jobEducation.totalCredits}학점`;
}

import { test } from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "./studentState.js";
import { evaluateGraduation } from "./evaluateGraduation.js";
import { buildCourseOverview } from "./overview.js";

// 직업교육 13과목 + 특수교육 9과목을 체크한 제1전공심화 학생
function createStudent() {
  const state = createInitialState(2023, "first-major");
  const codes = [
    "02706", "02723", "02721", "05062", "02728", "04286", "04839",
    "04836", "04837", "04666", "07068", "07066", "07067",
    "06039", "04834", "06045", "06043", "06042", "06047", "06048", "06046", "06040",
  ];
  for (const code of codes) state.checkedCourses[code] = true;
  return state;
}

function findSection(sections, id) {
  return sections.find((section) => section.id === id);
}

test("체크한 과목이 영역별로 정리된다 (특수교육 14과목, 표시과목 13과목)", () => {
  const state = createStudent();
  const sections = buildCourseOverview(state, evaluateGraduation(state));

  assert.equal(findSection(sections, "specialEducation").items.length, 14);
  assert.equal(findSection(sections, "subjectArea").items.length, 13);
  assert.equal(findSection(sections, "specialEducation").summary, "14과목 42학점");
});

test("직업교육의 중복과목은 특수교육 목록에 그 표시가 붙는다", () => {
  const state = createStudent();
  const sections = buildCourseOverview(state, evaluateGraduation(state));

  const autoAccepted = findSection(sections, "specialEducation").items.filter((item) =>
    item.detail.includes("중복과목"),
  );
  assert.equal(autoAccepted.length, 5);
});

test("아무것도 체크하지 않으면 각 영역의 목록이 비어 있다", () => {
  const state = createInitialState(2023);
  const sections = buildCourseOverview(state, evaluateGraduation(state));

  assert.equal(findSection(sections, "basicLiberal").items.length, 0);
  assert.equal(findSection(sections, "specialEducation").items.length, 0);
});

test("직업교육을 쓰지 않는 이수 유형(부전공)에는 표시과목(직업교육) 영역이 없다", () => {
  const state = createInitialState(2023, "minor");
  const sections = buildCourseOverview(state, evaluateGraduation(state));

  assert.equal(findSection(sections, "subjectArea"), undefined);
  assert.ok(findSection(sections, "secondMajor"));
});

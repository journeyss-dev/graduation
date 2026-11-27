import { test } from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../logic/studentState.js";
import { parseStudentStateText, serializeStudentState } from "./studentStorage.js";

test("백업 파일로 내보낸 입력을 다시 불러오면 같은 내용이 된다", () => {
  const state = createInitialState(2024, "minor");
  state.totalCredits = 120;
  state.checkedCourses["02706"] = true;

  const restored = parseStudentStateText(serializeStudentState(state));
  assert.deepEqual(restored, state);
});

test("옛 버전의 백업처럼 항목이 빠져 있으면 빈 값으로 채워서 불러온다", () => {
  const text = JSON.stringify({ version: 1, state: { admissionYear: 2023, trackId: "first-major", totalCredits: 100 } });
  const restored = parseStudentStateText(text);

  assert.equal(restored.totalCredits, 100);
  assert.deepEqual(restored.checkedCourses, {});
  assert.equal(restored.secondMajorConfirmed, false);
});

test("올바르지 않은 파일은 불러오지 않는다", () => {
  assert.equal(parseStudentStateText("이건 JSON이 아님"), null);
  assert.equal(parseStudentStateText(JSON.stringify({ version: 99, state: {} })), null);
  assert.equal(parseStudentStateText(JSON.stringify({ version: 1, state: { admissionYear: 1999, trackId: "first-major" } })), null);
  assert.equal(parseStudentStateText(JSON.stringify({ version: 1, state: { admissionYear: 2023, trackId: "없는유형" } })), null);
});

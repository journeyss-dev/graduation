// ============================================================
// 교양 데이터 (기초교양 · 중핵교양) — 입학년도별
// ------------------------------------------------------------
// 출처: 기존 zip 프로젝트의 BasicLiberalArtsRequired.json / CoreLiberalArtsRequired.json
//
// 기초교양은 학번마다 조금씩 다르므로 아래 목록은 "기본값"이다.
// 화면(5단계)에서는 학생이 과목을 추가·삭제·학점 수정할 수 있게 만들어, 실제 본인 기준에 맞춘다.
// ============================================================

// ---------- 기초교양: 필수 과목 목록 ----------
const basic2021 = [
  { name: "인간학1", credits: 2, term: "1-1" },
  { name: "키스톤디자인탐구소통", credits: 2, term: "1-1" },
  { name: "생애진로와커리어디자인", credits: 1, term: "1-1" },
  { name: "인간학2", credits: 2, term: "1-2" },
  { name: "키스톤디자인창의설계", credits: 2, term: "1-2" },
  { name: "그리스도교사상과문화", credits: 2, term: "2-2" },
  { name: "사랑나누기", credits: 2, term: "3-1" },
];

// 2022·2023학번: 키스톤디자인탐구소통 → 키스톤디자인인문창의 로 변경
const basic2022to2023 = basic2021.map((course) =>
  course.name === "키스톤디자인탐구소통"
    ? { ...course, name: "키스톤디자인인문창의" }
    : course,
);

// 2024학번 이후: 키스톤디자인이 3학점 1과목으로 통합
const basic2024later = [
  { name: "인간학1", credits: 2, term: "1-1" },
  { name: "인간학2", credits: 2, term: "1-2" },
  { name: "그리스도교사상과문화", credits: 2, term: "2-1" },
  { name: "키스톤디자인", credits: 3, term: "2-2" },
  { name: "사랑나누기", credits: 2, term: "3-1" },
];

// 입학년도 → { totalCredits: 기초교양 총 학점, courses: 필수 과목 }
export const basicLiberalArts = {
  2021: { totalCredits: 13, courses: basic2021 },
  2022: { totalCredits: 13, courses: basic2022to2023 },
  2023: { totalCredits: 13, courses: basic2022to2023 },
  2024: { totalCredits: 11, courses: basic2024later },
  2025: { totalCredits: 11, courses: basic2024later },
  2026: { totalCredits: 11, courses: basic2024later },
};

// ---------- 중핵교양: 영역 목록 ----------
// 중핵교양 과목은 모두 3학점이다. 과목은 학생이 직접 입력한다.
// 판정 규칙: ① 영역마다 minCredits 이상 이수 ② 중핵교양 전체 합계가 totalCredits 이상
// (영역 최소 학점의 합이 총 학점보다 작으면, 남는 학점은 어느 영역에서 채워도 된다.)
export const CORE_COURSE_CREDITS = 3;

// 영역 하나의 이수 기준을 만든다. 기본 최소 학점은 3학점(1과목).
const area = (name, minCredits = CORE_COURSE_CREDITS) => ({ name, minCredits });

const coreAreas2020to2021 = [area("인문·사회"), area("자연·과학"), area("문화·예술"), area("휴먼·테크")];
const coreAreas2022to2023 = [...coreAreas2020to2021, area("글로벌·외국어")];

// 2024학번만 글로벌·외국어를 5학점 이상 이수해야 한다.
// 과목이 3학점 단위라서 실제로는 2과목(6학점)을 이수하게 된다. (다른 학번은 해당 없음)
const coreAreas2024 = [
  area("DESIGN"),
  area("인문·사회"),
  area("자연·과학"),
  area("휴먼·테크"),
  area("글로벌·외국어", 5),
];

// 2025·2026학번: 4개 영역에서 1과목(3학점) 이상씩 이수하고, 총 18학점을 채운다.
// 영역 최소 학점의 합(12)보다 총 학점(18)이 크므로, 남는 6학점은 어느 영역에서든 채워도 된다.
const coreAreas2025later = [
  area("인문·사회"),
  area("자연·과학"),
  area("휴먼·테크"),
  area("글로벌·외국어"),
];

// 입학년도 → { totalCredits: 중핵교양 총 학점, areas: 영역별 최소 이수 기준 }
export const coreLiberalArts = {
  2020: { totalCredits: 12, areas: coreAreas2020to2021 },
  2021: { totalCredits: 12, areas: coreAreas2020to2021 },
  2022: { totalCredits: 15, areas: coreAreas2022to2023 },
  2023: { totalCredits: 15, areas: coreAreas2022to2023 },
  2024: { totalCredits: 18, areas: coreAreas2024 },
  2025: { totalCredits: 18, areas: coreAreas2025later },
  2026: { totalCredits: 18, areas: coreAreas2025later },
};

// ---------- 입학년도 ----------

// 선택할 수 있는 가장 오래된 입학년도 (시트 기준 2021학번부터)
export const FIRST_ADMISSION_YEAR = 2021;

// 선택 가능한 입학년도 목록을 만든다. (2021학번 ~ 올해)
// 해마다 목록을 직접 고치지 않아도 새 학번이 자동으로 늘어난다.
export function getAdmissionYears() {
  const thisYear = new Date().getFullYear();
  const years = [];
  for (let year = FIRST_ADMISSION_YEAR; year <= thisYear; year++) years.push(year);
  return years;
}

// 입학년도 선택의 기본값: 올해 - 3 (졸업사정이 필요한 4학년이 가장 많이 쓰기 때문)
// 예: 2026년이면 2023학번. 가장 오래된 학번(2021)보다 작아지면 2021학번으로 맞춘다.
export function getDefaultAdmissionYear() {
  return Math.max(FIRST_ADMISSION_YEAR, new Date().getFullYear() - 3);
}

// 기준 데이터가 등록된 가장 최근 입학년도
export function getLatestRuleYear() {
  return Math.max(...Object.keys(coreLiberalArts).map(Number));
}

// 입학년도에 해당하는 기준을 표(basicLiberalArts, coreLiberalArts)에서 찾는다.
// 아직 등록되지 않은 새 학번이면, 그보다 앞선 학번 중 가장 최근 기준을 대신 쓴다.
// (새 학번 기준이 바뀌면 위 표에 해당 학번을 추가하면 된다.)
export function findRuleForYear(table, year) {
  const availableYears = Object.keys(table).map(Number).filter((tableYear) => tableYear <= year);
  if (availableYears.length === 0) return null;
  return table[Math.max(...availableYears)];
}

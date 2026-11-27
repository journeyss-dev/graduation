import { useMemo, useState } from "react";
import { useStudentState } from "./hooks/useStudentState.js";
import { useTheme } from "./hooks/useTheme.js";
import { createInitialState } from "./logic/studentState.js";
import { evaluateGraduation } from "./logic/evaluateGraduation.js";
import TopBar from "./components/TopBar.jsx";
import IntroScreen from "./components/IntroScreen.jsx";
import SetupScreen from "./components/SetupScreen.jsx";
import Dashboard from "./components/Dashboard.jsx";
import TotalCreditsPage from "./components/pages/TotalCreditsPage.jsx";
import BasicLiberalPage from "./components/pages/BasicLiberalPage.jsx";
import CoreLiberalPage from "./components/pages/CoreLiberalPage.jsx";
import MajorBasicPage from "./components/pages/MajorBasicPage.jsx";
import SubjectAreaPage from "./components/pages/SubjectAreaPage.jsx";
import SecondMajorPage from "./components/pages/SecondMajorPage.jsx";
import SpecialEducationPage from "./components/pages/SpecialEducationPage.jsx";
import MajorCreditsPage from "./components/pages/MajorCreditsPage.jsx";
import TeachingPage from "./components/pages/TeachingPage.jsx";
import CertificationPage from "./components/pages/CertificationPage.jsx";

// 요건 id → 그 요건의 체크 화면. 새 체크 화면을 만들면 여기에 한 줄 추가한다.
const requirementPages = {
  totalCredits: TotalCreditsPage,
  basicLiberal: BasicLiberalPage,
  coreLiberal: CoreLiberalPage,
  majorBasic: MajorBasicPage,
  subjectArea: SubjectAreaPage,
  secondMajor: SecondMajorPage,
  specialEducation: SpecialEducationPage,
  majorCredits: MajorCreditsPage,
  teaching: TeachingPage,
  certification: CertificationPage,
};

// 앱 전체 흐름을 정한다. 위쪽의 상단 바는 모든 화면에서 똑같이 보이고, 아래 내용만 바뀐다.
//   처음 열었다               → 안내 화면 (참고용 안내) → 입학년도·이수 유형 선택 화면
//   요건을 눌렀다             → 그 요건의 체크 화면
//   그 외                     → 요건 현황 화면
// 입학년도·이수 유형을 바꾸려면 상단의 "처음으로"를 눌러 입력을 모두 지우고 다시 시작한다.
export default function App() {
  const { state, setState, saveFailed, reset } = useStudentState();
  const { theme, toggleTheme } = useTheme();
  const [openRequirementId, setOpenRequirementId] = useState(null);
  // 안내 화면을 읽고 넘어왔는지. 이미 저장된 입력이 있으면(다시 방문) 안내 화면을 건너뛴다.
  // "처음으로"로 돌아왔을 때도 이미 읽었으므로 다시 보여주지 않는다.
  const [hasReadIntro, setHasReadIntro] = useState(state !== null);

  // 학생 입력이 바뀔 때만 졸업 요건을 다시 판정한다. (처음 시작 전에는 null)
  const result = useMemo(() => (state === null ? null : evaluateGraduation(state)), [state]);

  // 입력의 일부만 바꾼다. 예: handleChange({ totalCredits: 120 })
  function handleChange(patch) {
    setState((previous) => ({ ...previous, ...patch }));
  }

  // 처음으로 돌아간다. 입력한 정보가 모두 지워지므로, 경고를 보여주고 확인을 받은 뒤에만 지운다.
  function handleGoHome() {
    const confirmed = window.confirm(
      "처음으로 돌아가면 입력한 정보가 모두 초기화됩니다.\n입학년도와 이수 유형도 다시 선택해야 해요.\n\n계속할까요?",
    );
    if (!confirmed) return;
    setOpenRequirementId(null);
    reset();
  }

  // 백업 파일에서 불러온 입력을 적용한다.
  function handleImport(importedState) {
    setOpenRequirementId(null);
    setState(importedState);
  }

  // 지금 보여줄 화면을 고른다.
  function renderScreen() {
    // 처음 시작: 안내 화면을 먼저 보여준다.
    if (state === null && !hasReadIntro) {
      return <IntroScreen onStart={() => setHasReadIntro(true)} />;
    }

    // 선택한 값으로 새 입력 상태를 만든다.
    if (state === null) {
      return <SetupScreen onSubmit={(year, trackId) => setState(createInitialState(year, trackId))} />;
    }

    // 요건 체크 화면
    const Page = requirementPages[openRequirementId];
    const openRequirement = result.requirements.find((requirement) => requirement.id === openRequirementId);
    if (Page && openRequirement) {
      return (
        <Page
          requirement={openRequirement}
          result={result}
          state={state}
          onChange={handleChange}
          onBack={() => setOpenRequirementId(null)}
        />
      );
    }

    return (
      <Dashboard
        state={state}
        result={result}
        availablePageIds={Object.keys(requirementPages)}
        onOpenRequirement={setOpenRequirementId}
        onImport={handleImport}
      />
    );
  }

  return (
    <>
      <TopBar onHome={state === null ? null : handleGoHome} theme={theme} onToggleTheme={toggleTheme} />
      {saveFailed && (
        <div className="warning-banner">
          이 브라우저에서는 자동 저장이 되지 않아요. 창을 닫으면 입력한 내용이 사라질 수 있습니다.
        </div>
      )}
      {renderScreen()}
    </>
  );
}

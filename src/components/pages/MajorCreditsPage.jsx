import RequirementPage from "../RequirementPage.jsx";
import DuplicationNotice from "../DuplicationNotice.jsx";
import StatusLine from "../StatusLine.jsx";
import { getTrack } from "../../logic/utils.js";

// 요건 7: 특수교육 + 표시과목 학점 화면.
// 입력할 것은 없고, 앞에서 체크한 과목으로 "성적표에 쌓이는 학점"이 어떻게 계산되는지 보여준다.
// 중복 인정 과목은 두 요건에 모두 들어가지만 성적표에는 한 번만 쌓이므로 그만큼 빼서 계산한다.
export default function MajorCreditsPage({ requirement, result, state, onBack }) {
  const track = getTrack(state.trackId);
  const { transcriptCredits, requiredCredits, duplicatedCredits } = requirement.detail;

  const findRequirement = (id) => result.requirements.find((item) => item.id === id);
  const specialCredits = findRequirement("specialEducation").detail.totalCredits;
  const jobCredits = track.usesJobEducation ? findRequirement("subjectArea").detail.totalCredits : 0;

  return (
    <RequirementPage title={requirement.title} completed={requirement.completed} onBack={onBack}>
      <section className="card">
        <h2>성적표 기준 학점 계산</h2>

        {track.usesJobEducation ? (
          <ul className="plain-list calc">
            <li><span>특수교육</span><span>{specialCredits}학점</span></li>
            <li><span>+ 표시과목(직업교육)</span><span>{jobCredits}학점</span></li>
            <li><span>− 중복 인정</span><span>{duplicatedCredits}학점</span></li>
            <li className="total"><span>= 성적표 기준 전공 학점</span><span>{transcriptCredits}학점</span></li>
          </ul>
        ) : (
          <p className="result-line">특수교육 {specialCredits}학점</p>
        )}

        <StatusLine label="필요한 학점" value={transcriptCredits} target={requiredCredits} unit="학점" />
        <p className="help">
          특수교육과 표시과목에서 한 과목이 양쪽에 인정되어도 성적표에는 한 번만 쌓여서, 두 영역을 합친 학점보다 적게 계산돼요.
        </p>
      </section>

      {track.usesJobEducation && <DuplicationNotice duplication={result.duplication} />}
    </RequirementPage>
  );
}

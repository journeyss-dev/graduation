// "요건을 모두 만족하였습니다" 체크 카드. (기초교양·중핵교양 화면 맨 위에서 사용)
// 체크하면 아래에서 과목을 하나씩 입력하지 않아도 그 요건을 이수한 것으로 본다.
// - label: 체크 문구, checked: 체크 여부, onChange(checked): 바뀔 때
export default function AllConfirmedCheck({ label, checked, onChange }) {
  return (
    <section className="card confirm-card">
      <label className="check-row">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span><strong>{label}</strong></span>
      </label>
      <p className="help">체크하면 아래 과목을 하나씩 입력하지 않아도 이수한 것으로 봐요.</p>
    </section>
  );
}

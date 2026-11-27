// "기본이수 5 / 7과목" 처럼 현재 값과 목표를 한 줄로 보여주고, 목표를 채웠으면 이수 표시를 붙인다.
// - label: 항목 이름, value: 현재 값, target: 목표 값, unit: 단위("과목", "학점")
export default function StatusLine({ label, value, target, unit }) {
  const done = value >= target;

  return (
    <div className="status-line">
      <span>{label}</span>
      <span className={`status ${done ? "done" : "todo"}`}>
        {value} / {target}{unit}
      </span>
    </div>
  );
}

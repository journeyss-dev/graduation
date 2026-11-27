import { useState } from "react";
import { parseStudentStateText, serializeStudentState } from "../storage/studentStorage.js";

// 입력 내용을 파일로 저장하거나(내보내기), 저장해 둔 파일에서 되살린다(불러오기).
// 서버가 없어서 입력이 이 브라우저에만 저장되므로, 다른 기기나 브라우저로 옮길 때 사용한다.
// - state: 학생 입력 상태
// - onImport(newState): 불러온 입력을 앱에 적용
export default function BackupPanel({ state, onImport }) {
  const [message, setMessage] = useState("");

  // 현재 입력을 JSON 파일로 내려받는다. 파일 이름 예: graduation-2023.json
  function exportFile() {
    const blob = new Blob([serializeStudentState(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `graduation-${state.admissionYear}.json`;
    link.click();

    URL.revokeObjectURL(url);
    setMessage("파일로 저장했어요.");
  }

  // 선택한 백업 파일을 읽어 입력을 되살린다. 올바른 파일이 아니면 안내만 한다.
  async function importFile(event) {
    const file = event.target.files[0];
    event.target.value = ""; // 같은 파일을 다시 골라도 동작하도록 비운다
    if (!file) return;

    const restored = parseStudentStateText(await file.text());
    if (restored === null) {
      setMessage("이 파일은 불러올 수 없어요. 이 앱에서 저장한 파일인지 확인해 주세요.");
      return;
    }

    if (!window.confirm("지금 입력한 내용이 파일의 내용으로 바뀝니다. 계속할까요?")) return;
    onImport(restored);
    setMessage("파일에서 불러왔어요.");
  }

  return (
    <section className="card no-print">
      <h2>입력 내용 백업</h2>
      <p className="help">
        입력한 내용은 이 브라우저에만 저장돼요. 다른 기기나 브라우저에서 이어서 쓰려면 파일로 저장했다가 불러오세요.
      </p>

      <div className="backup-actions">
        <button className="button small secondary" onClick={exportFile}>파일로 저장</button>
        <label className="button small secondary file-button">
          파일에서 불러오기
          <input type="file" accept="application/json,.json" onChange={importFile} />
        </label>
      </div>

      {message && <p className="help">{message}</p>}
    </section>
  );
}

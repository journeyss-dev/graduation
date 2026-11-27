import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Vite 설정 파일. 빌드 방식이 두 가지다.
//
//   npm run build         → dist/         여러 파일로 나뉜 일반 빌드 (GitHub Pages 에 올리는 용도)
//   npm run build:single  → dist-single/  HTML 파일 하나에 모든 것을 합친 빌드 (학생이 내려받아 쓰는 용도)
//
// base: "./" → 배포 주소가 어디든(GitHub Pages 하위 경로, 내 컴퓨터 폴더 등) 파일 경로가 깨지지 않게 상대경로로 만든다.
export default defineConfig(({ mode }) => {
  const isSingleFile = mode === "single";

  return {
    base: "./",
    plugins: [react(), ...(isSingleFile ? [viteSingleFile()] : [])],
    build: { outDir: isSingleFile ? "dist-single" : "dist" },
  };
});

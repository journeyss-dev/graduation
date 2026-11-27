# 졸업사정 자가체크 (가톨릭대학교 특수교육과)

입학년도와 이수 유형을 고르고 과목을 체크하면 졸업 요건을 얼마나 채웠는지 보여주는 웹 앱입니다.
서버 없이 브라우저에서만 동작하고, 입력한 내용은 학생의 브라우저에만 저장됩니다.

> 참고용입니다. 정확한 내용은 학과 홈페이지 확인과 학과 조교 상담이 필요합니다.

## 자주 쓰는 명령어

PowerShell에서는 `npm` 대신 `npm.cmd`를 쓰세요. (실행 정책 때문에 `npm`이 막혀 있을 수 있습니다)

| 명령어 | 하는 일 |
|---|---|
| `npm.cmd install` | 필요한 패키지 설치 (처음 한 번) |
| `npm.cmd run dev` | 개발용 서버 실행 → 브라우저에서 `http://localhost:5173/` |
| `npm.cmd test` | 졸업 판정 로직 테스트 |
| `npm.cmd run check:rules` | 규칙 데이터의 학점 합계가 서로 맞는지 점검 |
| `npm.cmd run build` | 웹페이지 빌드 → `dist/` (GitHub Pages용) |
| `npm.cmd run build:single` | HTML 한 파일 빌드 → `dist-single/index.html` (학생 배포용) |

## 졸업 기준이 바뀌었을 때 고치는 곳

학점 기준과 과목 목록은 화면 코드와 분리되어 `src/rules/` 에 있습니다. 숫자와 과목명만 고치면 됩니다.

| 파일 | 내용 |
|---|---|
| `src/rules/courses.js` | 전공 과목, 교직 과목 목록 |
| `src/rules/liberalArts.js` | 입학년도별 기초교양, 중핵교양 기준 |
| `src/rules/requirements.js` | 총 학점, 특수교육·직업교육 학점, 이수 유형, 교직 기준, 학과 연락처, 안내 주소 |

고친 뒤에는 `npm.cmd run check:rules` 와 `npm.cmd test` 를 실행해서 오류가 없는지 확인하세요.
새 학번 기준이 생기면 `liberalArts.js`의 표(`basicLiberalArts`, `coreLiberalArts`)에 그 학번을 한 줄 추가합니다.
(기준이 없는 새 학번은 가장 최근 학번의 기준으로 판정됩니다.)

## 폴더 구조

```
src/
├─ rules/        학점 기준·과목 목록 (데이터)
├─ logic/        졸업 판정 (화면과 무관한 순수 함수) + 테스트
├─ storage/      브라우저 저장·백업 파일 읽기/쓰기
├─ hooks/        저장 상태·화면 모드 관리
├─ components/   화면 (안내, 선택, 현황, 요건별 체크 화면)
└─ App.jsx       어떤 화면을 보여줄지 결정
```

## 배포

### 방법 1. GitHub Pages (학생들이 주소로 접속)

`main` 브랜치에 코드를 올리면 `.github/workflows/deploy.yml` 이 자동으로 테스트 → 빌드 → 배포합니다.

처음 한 번만 필요한 설정:

1. GitHub에서 새 저장소를 만든다. (Public)
2. 저장소의 `Settings` → `Pages` → `Build and deployment` → `Source` 를 **GitHub Actions** 로 바꾼다.
3. 이 폴더의 코드를 저장소에 올린다.

```
git init -b main
git add .
git commit -m "졸업사정 자가체크 첫 버전"
git remote add origin https://github.com/<내 아이디>/<저장소 이름>.git
git push -u origin main
```

이후 수정할 때마다:

```
git add .
git commit -m "무엇을 고쳤는지 한 줄로"
git push
```

배포 주소: `https://<내 아이디>.github.io/<저장소 이름>/`
진행 상황은 저장소의 `Actions` 탭에서 볼 수 있고, 초록색 체크가 뜨면 완료입니다. (보통 1~2분)

### 방법 2. HTML 한 파일 (학생이 내려받아 사용)

`npm.cmd run build:single` 을 실행하면 `dist-single/index.html` 하나가 만들어집니다.
이 파일을 학생들에게 전달하면, 더블클릭만으로 인터넷 없이도 쓸 수 있습니다.

GitHub Pages로 배포하면 같은 파일이 `https://<내 아이디>.github.io/<저장소 이름>/graduation.html` 에도 함께 올라가므로,
이 주소의 링크를 공유해서 내려받게 할 수도 있습니다.

### 알아둘 점

- 입력 내용은 **브라우저마다 따로** 저장됩니다. 다른 기기로 옮기려면 현황 화면의 "파일로 저장 / 파일에서 불러오기"를 쓰세요.
- HTML 파일을 다른 폴더로 옮기면 브라우저가 다른 사이트로 보아 저장된 입력이 보이지 않을 수 있습니다. 이때도 백업 파일로 옮기면 됩니다.

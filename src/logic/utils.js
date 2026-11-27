import { tracks } from "../rules/requirements.js";

// 과목 목록의 학점 합계를 구한다.
// - courses: credits 필드를 가진 과목 배열
export function sumCredits(courses) {
  return courses.reduce((sum, course) => sum + course.credits, 0);
}

// 과목이 해당 이수 유형에서 쓰이는 과목인지 확인한다.
// 과목에 onlyTracks(예: 복수전공에서만 쓰는 학교현장실습)가 있으면 그 이수 유형에서만 true.
export function isCourseAvailableForTrack(course, trackId) {
  return !course.onlyTracks || course.onlyTracks.includes(trackId);
}

// 이수 유형 id(예: "first-major")로 이수 유형 기준을 찾는다.
export function getTrack(trackId) {
  return tracks.find((track) => track.id === trackId);
}

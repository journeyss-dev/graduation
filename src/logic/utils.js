import { tracks } from "../rules/requirements.js";

// 과목 목록의 학점 합계를 구한다.
// - courses: credits 필드를 가진 과목 배열
export function sumCredits(courses) {
  return courses.reduce((sum, course) => sum + course.credits, 0);
}

// 이수 유형 id(예: "first-major")로 이수 유형 기준을 찾는다.
export function getTrack(trackId) {
  return tracks.find((track) => track.id === trackId);
}

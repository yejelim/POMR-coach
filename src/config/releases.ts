export type ReleaseNote = {
  version: string;
  date: string;
  title: string;
  body: string;
};

export const currentRelease: ReleaseNote = {
  version: "0.9.0-beta.1",
  date: "2026-07-03",
  title: "업데이트 안내",
  body: "앞으로 이 팝업창에 업데이트 내역이 표시됩니다. 새로운 기능과 개선 사항을 확인하세요.",
};

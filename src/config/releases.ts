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
  body: "현재 개발자가 업데이트 중입니다....",
};

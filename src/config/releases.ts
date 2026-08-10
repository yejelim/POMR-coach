export type ReleaseNote = {
  version: string;
  date: string;
  title: string;
  body: string;
};

export const currentRelease: ReleaseNote = {
  version: "0.9.5-beta.1",
  date: "2026-08-10",
  title: "새 학기 베타 업데이트 안내",
  body: "Admission 입력 항목 이름을 더 쉽게 풀어썼습니다.\n\nROS 체크 시 증상 이름이 가려지지 않도록 메모 입력 UX를 개선했습니다.\n\nProgress SOAP note에서 저장 후 이전/다음 날짜 노트로 이동할 수 있습니다.\n\nLab table에는 이상치를 빨간색/파란색으로 표시할 수 있고, export에도 반영됩니다.",
};

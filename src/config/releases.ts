export type ReleaseNote = {
  version: string;
  date: string;
  title: string;
  body: string;
};

export const currentRelease: ReleaseNote = {
  version: "0.9.4-beta.1",
  date: "2026-07-08",
  title: "업데이트 안내",
  body: "-Export 탭에 [Progress SOAP note 시간순으로 내보내기] 기능이 추가되었습니다. feedback from betatester LUKE \n\n-큰 이미지 업로드시 자동으로 압축되도록 개선하여 이미지가 많아져도 저장 속도가 느려지지 않습니다.\n\n SOAP note 작성시에도 BOLD/Highlight 표시가 가능합니다.",
};

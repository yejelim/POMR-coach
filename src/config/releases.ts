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
  body: "Export 탭에 [Progress SOAP note 시간순으로 내보내기] 기능이 추가되었습니다. feedback from betatester LUKE \n\n SOAP note 작성시에도 Highlight 표시가 가능합니다. Lab table에는 이상치 빨간색/파란색 표시가 가능합니다. 발표용 자료로까지 활용해보세요.",
};

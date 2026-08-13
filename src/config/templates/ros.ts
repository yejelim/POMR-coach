export type RosTemplateGroup = {
  category: string;
  koreanCategory: string;
  description: string;
  items: Array<{
    label: string;
    korean: string;
  }>;
};

export const rosTemplateGroups: RosTemplateGroup[] = [
  {
    category: "General",
    koreanCategory: "전신",
    description: "General: fever, weight change처럼 전신 상태를 확인합니다.",
    items: [
      { label: "Fever", korean: "발열" },
      { label: "Chill", korean: "오한" },
      { label: "Sweating", korean: "발한" },
      { label: "General weakness", korean: "전신 쇠약감" },
      { label: "Fatigue", korean: "피로감" },
      { label: "Weight loss", korean: "체중 감소" },
    ],
  },
  {
    category: "HEENT",
    koreanCategory: "두경부",
    description: "HEENT: Head, Eyes, Ears, Nose, Throat 관련 증상입니다.",
    items: [
      { label: "Headache", korean: "두통" },
      { label: "Dizziness", korean: "어지러움" },
      { label: "Dry mouth", korean: "구강 건조" },
      { label: "Visual difficulty", korean: "시야/시력 불편" },
      { label: "Photophobia", korean: "눈부심" },
      { label: "Sore throat", korean: "인후통" },
      { label: "Cough", korean: "기침" },
      { label: "Sputum", korean: "가래" },
      { label: "Rhinorrhea", korean: "콧물" },
      { label: "Nasal stiffness", korean: "코막힘" },
    ],
  },
  {
    category: "Chest",
    koreanCategory: "흉부",
    description: "Chest: 심폐 증상과 호흡 관련 불편감을 확인합니다.",
    items: [
      { label: "Chest pain", korean: "흉통" },
      { label: "Dyspnea", korean: "호흡곤란" },
      { label: "Orthopnea", korean: "기좌호흡" },
      { label: "Hemoptysis", korean: "객혈" },
      { label: "Palpitation", korean: "두근거림" },
    ],
  },
  {
    category: "GI",
    koreanCategory: "위장관",
    description: "GI: Gastrointestinal, 소화기 증상입니다.",
    items: [
      { label: "Anorexia", korean: "식욕부진" },
      { label: "Nausea", korean: "오심" },
      { label: "Vomiting", korean: "구토" },
      { label: "Constipation", korean: "변비" },
      { label: "Diarrhea", korean: "설사" },
      { label: "Abdominal pain", korean: "복통" },
      { label: "Hematochezia", korean: "혈변" },
      { label: "Melena", korean: "흑변" },
      { label: "Epigastric soreness", korean: "명치 불편감" },
      { label: "Dysphagia", korean: "삼킴곤란" },
      { label: "Abdominal distention", korean: "복부팽만" },
      { label: "Jaundice", korean: "황달" },
      { label: "Dyspepsia", korean: "소화불량" },
    ],
  },
  {
    category: "GU",
    koreanCategory: "비뇨생식기",
    description: "GU: Genitourinary, 배뇨 관련 증상입니다.",
    items: [
      { label: "Frequency", korean: "빈뇨" },
      { label: "Urgency", korean: "요절박" },
      { label: "Nocturia", korean: "야간뇨" },
      { label: "Dysuria", korean: "배뇨통" },
    ],
  },
  {
    category: "Skin",
    koreanCategory: "피부",
    description: "Skin: 피부 병변, 가려움, 멍 등을 확인합니다.",
    items: [
      { label: "Rash", korean: "발진" },
      { label: "Pruritus", korean: "소양감" },
      { label: "Easy bruising", korean: "멍이 잘 듦" },
    ],
  },
  {
    category: "Musculoskeletal",
    koreanCategory: "근골격",
    description: "Musculoskeletal: 근육, 관절, 뼈 통증과 운동 제한을 확인합니다.",
    items: [
      { label: "Myalgia", korean: "근육통" },
      { label: "Arthralgia", korean: "관절통" },
      { label: "Tingling", korean: "저림" },
      { label: "Osteoporosis", korean: "골다공증" },
      { label: "Bone fracture", korean: "골절" },
      { label: "Spine/Rib pain", korean: "척추/늑골 통증" },
    ],
  },
  {
    category: "Mental",
    koreanCategory: "정신/의식",
    description: "Mental: 수면, 의식 변화 등 정신상태 관련 증상입니다.",
    items: [
      { label: "Insomnia", korean: "불면" },
      { label: "Mental status change", korean: "의식/인지 변화" },
    ],
  },
];

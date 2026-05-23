export type RosTemplateGroup = {
  category: string;
  items: string[];
};

export const rosTemplateGroups: RosTemplateGroup[] = [
  {
    category: "General",
    items: ["Fever", "Chill", "Sweating", "General weakness", "Fatigue", "Weight loss"],
  },
  {
    category: "HEENT",
    items: [
      "Headache",
      "Dizziness",
      "Dry mouth",
      "Visual difficulty",
      "Photophobia",
      "Sore throat",
      "Cough",
      "Sputum",
      "Rhinorrhea",
      "Nasal stiffness",
    ],
  },
  {
    category: "Chest",
    items: ["Chest pain", "Dyspnea", "Orthopnea", "Hemoptysis", "Palpitation"],
  },
  {
    category: "GI",
    items: [
      "Anorexia",
      "Nausea",
      "Vomiting",
      "Constipation",
      "Diarrhea",
      "Abdominal pain",
      "Hematochezia",
      "Melena",
      "Epigastric soreness",
      "Dysphagia",
      "Abdominal distention",
      "Jaundice",
      "Dyspepsia",
    ],
  },
  {
    category: "GU",
    items: ["Frequency", "Urgency", "Nocturia", "Dysuria"],
  },
  {
    category: "Skin",
    items: ["Rash", "Pruritus", "Easy bruising"],
  },
  {
    category: "Musculoskeletal",
    items: [
      "Myalgia",
      "Arthralgia",
      "Tingling",
      "Osteoporosis",
      "Bone fracture",
      "Spine/Rib pain",
    ],
  },
  {
    category: "Mental",
    items: ["Insomnia", "Mental status change"],
  },
];


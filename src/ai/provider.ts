import OpenAI from "openai";
import { aiFeedbackJsonSchema, aiFeedbackSchema } from "@/ai/schema";
import { aiReviewerSystemPrompt } from "@/ai/prompts/shared";
import type { AiFeedback } from "@/lib/types";

export async function requestAiFeedback(prompt: string): Promise<{
  feedback: AiFeedback;
  model: string;
  usedMock: boolean;
}> {
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const shouldMock = process.env.AI_MOCK_MODE === "true" || !process.env.OPENAI_API_KEY;

  if (shouldMock) {
    return { feedback: mockFeedback(prompt), model: "local-mock", usedMock: true };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model,
    instructions: aiReviewerSystemPrompt,
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "pomr_feedback",
        strict: true,
        schema: aiFeedbackJsonSchema,
      },
    },
  });

  const outputText = response.output_text;
  const parsedJson = JSON.parse(outputText);
  const parsed = aiFeedbackSchema.parse(parsedJson);
  return { feedback: parsed, model, usedMock: false };
}

function mockFeedback(prompt: string): AiFeedback {
  const hasPhiPattern =
    /\b\d{6}-\d{7}\b|\b01[016789]-?\d{3,4}-?\d{4}\b|등록번호|주민등록|환자명/.test(
      prompt,
    );

  return {
    summary:
      "AI provider가 설정되지 않아 로컬 mock feedback을 표시합니다. 구조, 해석, 누락 데이터 중심으로 초안을 다시 점검하세요.",
    strengths: [
      "사용자 초안을 먼저 작성한 뒤 feedback을 요청하는 흐름이 유지되었습니다.",
      "POMR 형식에 맞춰 evidence와 plan을 분리해 검토할 수 있습니다.",
    ],
    concerns: [
      "Assessment가 단순 data 반복인지, interpretation인지 한 번 더 확인하세요.",
      "진단/치료 계획은 교육용 reasoning plan으로 표현하고 확정적 지시처럼 쓰지 마세요.",
    ],
    missingData: ["핵심 positive/negative finding과 remaining uncertainty가 명시되어 있는지 확인하세요."],
    revisionChecklist: [
      "각 문제의 active/improving/worsening/stable 상태를 표시합니다.",
      "계획이 assessment에서 나온 판단을 직접 따라가는지 확인합니다.",
      "Korean clinical writing 안에서 English medical terms를 일관되게 유지합니다.",
    ],
    safetyPrivacyFlags: hasPhiPattern
      ? ["PHI로 보이는 표현이 있습니다. 이름, 등록번호, 주민등록번호, 전화번호는 제거하세요."]
      : ["직접 식별자는 보이지 않습니다. 실제 환자 정보 입력은 계속 피하세요."],
  };
}

type CasePromptLike = {
  title: string;
  department: string;
  summary: string;
  admissionNote?: {
    cc: string;
    hpi: string;
    ros: string;
    physicalExam: string;
    imageProcedureText: string;
  } | null;
};

export function caseToPrompt(caseRecord: CasePromptLike) {
  const admission = caseRecord.admissionNote;
  return [
    `Case: ${caseRecord.title}`,
    `Department: ${caseRecord.department}`,
    `Anonymous summary: ${caseRecord.summary || "-"}`,
    admission
      ? [
          `CC: ${admission.cc || "-"}`,
          `HPI: ${admission.hpi || "-"}`,
          `ROS: ${admission.ros || "-"}`,
          `PE: ${admission.physicalExam || "-"}`,
          `Image/procedure text: ${admission.imageProcedureText || "-"}`,
        ].join("\n")
      : "Admission note: not entered.",
  ].join("\n");
}

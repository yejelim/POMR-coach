export const workflowOrder = [
  "overview",
  "timeline",
  "admission",
  "initial",
  "data",
  "final",
  "problems",
  "progress",
  "export",
] as const;

export type WorkflowStep = (typeof workflowOrder)[number];

export function workflowHref(caseId: string, step: WorkflowStep) {
  const paths: Record<WorkflowStep, string> = {
    overview: "",
    timeline: "timeline",
    admission: "admission",
    initial: "impression/initial",
    data: "data",
    final: "impression/final",
    problems: "problems",
    progress: "progress",
    export: "export",
  };
  const path = paths[step];
  return `/cases/${caseId}${path ? `/${path}` : ""}`;
}

export function workflowNav(caseId: string, step: WorkflowStep) {
  const index = workflowOrder.indexOf(step);
  return {
    currentHref: workflowHref(caseId, step),
    previousHref: index > 0 ? workflowHref(caseId, workflowOrder[index - 1]) : "/cases",
    nextHref:
      index < workflowOrder.length - 1
        ? workflowHref(caseId, workflowOrder[index + 1])
        : undefined,
  };
}

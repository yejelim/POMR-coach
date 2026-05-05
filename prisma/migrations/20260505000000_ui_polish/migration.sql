ALTER TABLE "AdmissionNote" ADD COLUMN "alcoholHistory" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AdmissionNote" ADD COLUMN "smokingHistory" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProgressNoteProblem" ADD COLUMN "objectiveItems" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProgressNoteProblem" ADD COLUMN "planItems" TEXT NOT NULL DEFAULT '';

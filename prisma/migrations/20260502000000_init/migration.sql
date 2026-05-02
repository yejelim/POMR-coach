-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'General',
    "status" TEXT NOT NULL DEFAULT 'active',
    "summary" TEXT NOT NULL DEFAULT '',
    "templateKey" TEXT NOT NULL DEFAULT 'generic',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CaseTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseTag_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimelineEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "timepoint" TEXT NOT NULL DEFAULT '',
    "event" TEXT NOT NULL DEFAULT '',
    "interpretation" TEXT NOT NULL DEFAULT '',
    "question" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TimelineEntry_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdmissionNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "cc" TEXT NOT NULL DEFAULT '',
    "hpi" TEXT NOT NULL DEFAULT '',
    "pmh" TEXT NOT NULL DEFAULT '',
    "psh" TEXT NOT NULL DEFAULT '',
    "medication" TEXT NOT NULL DEFAULT '',
    "allergy" TEXT NOT NULL DEFAULT '',
    "familyHistory" TEXT NOT NULL DEFAULT '',
    "socialHistory" TEXT NOT NULL DEFAULT '',
    "ros" TEXT NOT NULL DEFAULT '',
    "physicalExam" TEXT NOT NULL DEFAULT '',
    "initialVitals" TEXT NOT NULL DEFAULT '{}',
    "imageProcedureText" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdmissionNote_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiagnosticData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "labTable" TEXT NOT NULL DEFAULT '',
    "imageFindingsText" TEXT NOT NULL DEFAULT '',
    "procedureFindingsText" TEXT NOT NULL DEFAULT '',
    "summaryText" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiagnosticData_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImpressionRow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL DEFAULT '',
    "evidence" TEXT NOT NULL DEFAULT '',
    "evidenceAgainst" TEXT NOT NULL DEFAULT '',
    "missingData" TEXT NOT NULL DEFAULT '',
    "dxPlan" TEXT NOT NULL DEFAULT '',
    "txPlan" TEXT NOT NULL DEFAULT '',
    "extra" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ImpressionRow_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'active',
    "evidence" TEXT NOT NULL DEFAULT '',
    "linkedImpressionRowId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Problem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Problem_linkedImpressionRowId_fkey" FOREIGN KEY ("linkedImpressionRowId") REFERENCES "ImpressionRow" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "date" TEXT NOT NULL DEFAULT '',
    "hospitalDay" TEXT NOT NULL DEFAULT '',
    "vitals" TEXT NOT NULL DEFAULT '{}',
    "diet" TEXT NOT NULL DEFAULT '',
    "io" TEXT NOT NULL DEFAULT '',
    "overnightEvent" TEXT NOT NULL DEFAULT '',
    "drainTube" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgressNote_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressNoteProblem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "progressNoteId" TEXT NOT NULL,
    "problemId" TEXT,
    "titleSnapshot" TEXT NOT NULL DEFAULT '',
    "subjective" TEXT NOT NULL DEFAULT '',
    "objectivePe" TEXT NOT NULL DEFAULT '',
    "objectiveLab" TEXT NOT NULL DEFAULT '',
    "objectiveImageProcedure" TEXT NOT NULL DEFAULT '',
    "objectiveDrain" TEXT NOT NULL DEFAULT '',
    "assessment" TEXT NOT NULL DEFAULT '',
    "planDx" TEXT NOT NULL DEFAULT '',
    "planTx" TEXT NOT NULL DEFAULT '',
    "planMonitoring" TEXT NOT NULL DEFAULT '',
    "planEducation" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgressNoteProblem_progressNoteId_fkey" FOREIGN KEY ("progressNoteId") REFERENCES "ProgressNote" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProgressNoteProblem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "reviewType" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "renderedText" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiReview_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CaseTag_caseId_idx" ON "CaseTag"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseTag_caseId_name_key" ON "CaseTag"("caseId", "name");

-- CreateIndex
CREATE INDEX "TimelineEntry_caseId_position_idx" ON "TimelineEntry"("caseId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionNote_caseId_key" ON "AdmissionNote"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosticData_caseId_key" ON "DiagnosticData"("caseId");

-- CreateIndex
CREATE INDEX "ImpressionRow_caseId_stage_rank_idx" ON "ImpressionRow"("caseId", "stage", "rank");

-- CreateIndex
CREATE INDEX "Problem_caseId_position_idx" ON "Problem"("caseId", "position");

-- CreateIndex
CREATE INDEX "ProgressNote_caseId_date_idx" ON "ProgressNote"("caseId", "date");

-- CreateIndex
CREATE INDEX "ProgressNoteProblem_progressNoteId_position_idx" ON "ProgressNoteProblem"("progressNoteId", "position");

-- CreateIndex
CREATE INDEX "AiReview_caseId_reviewType_createdAt_idx" ON "AiReview"("caseId", "reviewType", "createdAt");

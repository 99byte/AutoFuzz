-- CreateTable
CREATE TABLE "FuzzTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "targetApp" TEXT NOT NULL,
    "appDescription" TEXT,
    "testCases" TEXT NOT NULL,
    "testConfig" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "TestExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "testCaseIndex" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "duration" INTEGER,
    "logs" TEXT,
    "screenshotUrl" TEXT,
    CONSTRAINT "TestExecution_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "FuzzTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrashReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executionId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "crashType" TEXT NOT NULL,
    "stackTrace" TEXT,
    "package" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT,
    "screenshotPath" TEXT,
    "logcatPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrashReport_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "TestExecution" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrashReport_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "FuzzTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "totalCases" INTEGER NOT NULL,
    "passedCases" INTEGER NOT NULL,
    "failedCases" INTEGER NOT NULL,
    "crashCount" INTEGER NOT NULL,
    "timeoutCount" INTEGER NOT NULL,
    "executionTime" INTEGER NOT NULL,
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestResult_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "FuzzTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FuzzTask_status_idx" ON "FuzzTask"("status");

-- CreateIndex
CREATE INDEX "FuzzTask_createdAt_idx" ON "FuzzTask"("createdAt");

-- CreateIndex
CREATE INDEX "TestExecution_taskId_idx" ON "TestExecution"("taskId");

-- CreateIndex
CREATE INDEX "TestExecution_status_idx" ON "TestExecution"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CrashReport_executionId_key" ON "CrashReport"("executionId");

-- CreateIndex
CREATE INDEX "CrashReport_taskId_idx" ON "CrashReport"("taskId");

-- CreateIndex
CREATE INDEX "CrashReport_severity_idx" ON "CrashReport"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "TestResult_taskId_key" ON "TestResult"("taskId");

-- CreateIndex
CREATE INDEX "TestResult_taskId_idx" ON "TestResult"("taskId");

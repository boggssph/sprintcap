-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "capacity_tickets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "assignee" TEXT,
    "jiraKey" TEXT,
    "sprintId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capacity_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "capacity_tickets_sprintId_idx" ON "capacity_tickets"("sprintId");

-- AddForeignKey
ALTER TABLE "capacity_tickets" ADD CONSTRAINT "capacity_tickets_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

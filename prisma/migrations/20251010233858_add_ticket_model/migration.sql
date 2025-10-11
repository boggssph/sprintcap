/*
  Warnings:

  - You are about to drop the column `category` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `estimate` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Ticket` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sprintId,jiraId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hours` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plannedUnplanned` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workType` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Made the column `jiraId` on table `Ticket` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `parentType` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Made the column `sprintId` on table `Ticket` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('BACKEND', 'FRONTEND', 'TESTING');

-- CreateEnum
CREATE TYPE "ParentType" AS ENUM ('BUG', 'STORY', 'TASK');

-- CreateEnum
CREATE TYPE "PlannedUnplanned" AS ENUM ('PLANNED', 'UNPLANNED');

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_sprintId_fkey";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "category",
DROP COLUMN "estimate",
DROP COLUMN "title",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hours" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "memberId" TEXT,
ADD COLUMN     "plannedUnplanned" "PlannedUnplanned" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workType" "WorkType" NOT NULL,
ALTER COLUMN "jiraId" SET NOT NULL,
DROP COLUMN "parentType",
ADD COLUMN     "parentType" "ParentType" NOT NULL,
ALTER COLUMN "sprintId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_sprintId_jiraId_key" ON "Ticket"("sprintId", "jiraId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

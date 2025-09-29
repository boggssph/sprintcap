/*
  Warnings:

  - You are about to drop the column `number` on the `Sprint` table. All the data in the column will be lost.
  - You are about to drop the column `dailyHours` on the `SprintMember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[squadId,name]` on the table `Sprint` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sprintId,userId]` on the table `SprintMember` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Sprint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Sprint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sprint" DROP COLUMN "number",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SprintMember" DROP COLUMN "dailyHours",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Sprint_squadId_name_key" ON "Sprint"("squadId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SprintMember_sprintId_userId_key" ON "SprintMember"("sprintId", "userId");

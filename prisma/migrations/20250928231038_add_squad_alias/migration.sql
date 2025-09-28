/*
  Warnings:

  - A unique constraint covering the columns `[alias]` on the table `Squad` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alias` to the `Squad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Squad" ADD COLUMN     "alias" TEXT NOT NULL DEFAULT 'DEFAULT';

-- Update existing squad with proper alias
UPDATE "Squad" SET "alias" = 'FMBROWSE' WHERE "id" = '32ae6e52-bb17-4b70-ad3a-c4481ad8493d';

-- AlterTable (remove default after setting values)
ALTER TABLE "Squad" ALTER COLUMN "alias" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Squad_alias_key" ON "Squad"("alias");

-- CreateEnum
CREATE TYPE "SprintStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "status" "SprintStatus" NOT NULL DEFAULT 'INACTIVE';

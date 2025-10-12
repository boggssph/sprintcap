-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "dailyScrumMinutes" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "sprintPlanningMinutes" INTEGER NOT NULL DEFAULT 120,
ADD COLUMN     "sprintRetrospectiveMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "sprintReviewMinutes" INTEGER NOT NULL DEFAULT 60;

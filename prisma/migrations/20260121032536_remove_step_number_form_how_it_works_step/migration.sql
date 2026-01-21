/*
  Warnings:

  - You are about to drop the column `stepNumber` on the `HowItWorksStep` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "HowItWorksStep_stepNumber_key";

-- AlterTable
ALTER TABLE "HowItWorksStep" DROP COLUMN "stepNumber";

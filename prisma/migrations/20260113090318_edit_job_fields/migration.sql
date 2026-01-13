/*
  Warnings:

  - The `photo` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `documents` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "photo",
ADD COLUMN     "photo" TEXT[],
DROP COLUMN "documents",
ADD COLUMN     "documents" TEXT[];

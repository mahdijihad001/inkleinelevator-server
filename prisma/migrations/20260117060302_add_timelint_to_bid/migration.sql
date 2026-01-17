/*
  Warnings:

  - The `bidAmount` column on the `Bid` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "timeline" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "bidAmount",
ADD COLUMN     "bidAmount" INTEGER NOT NULL DEFAULT 0;

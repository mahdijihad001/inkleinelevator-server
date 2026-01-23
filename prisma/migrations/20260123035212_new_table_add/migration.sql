/*
  Warnings:

  - You are about to drop the column `isPlainText` on the `HowItsForCard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HowItsForCard" DROP COLUMN "isPlainText";

-- CreateTable
CREATE TABLE "Faq" (
    "qaCardId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "ans" TEXT NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("qaCardId")
);

-- CreateEnum
CREATE TYPE "AudienceType" AS ENUM ('JOB_REQUESTER', 'CONTRACTOR');

-- CreateTable
CREATE TABLE "HowItsFor" (
    "sectionId" TEXT NOT NULL,
    "how_its_for_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HowItsFor_pkey" PRIMARY KEY ("sectionId")
);

-- CreateTable
CREATE TABLE "HowItsForCard" (
    "audienceId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "type" "AudienceType" NOT NULL,
    "cardTitle" TEXT NOT NULL,
    "cardSubtitle" TEXT,
    "bulletText" TEXT NOT NULL,
    "isPlainText" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HowItsForCard_pkey" PRIMARY KEY ("audienceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "HowItsFor_how_its_for_key_key" ON "HowItsFor"("how_its_for_key");

-- AddForeignKey
ALTER TABLE "HowItsForCard" ADD CONSTRAINT "HowItsForCard_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "HowItsFor"("sectionId") ON DELETE CASCADE ON UPDATE CASCADE;

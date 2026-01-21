-- CreateTable
CREATE TABLE "HeroSection" (
    "id" TEXT NOT NULL,
    "heroKay" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "mainTitle" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "primaryCTA" TEXT NOT NULL,
    "secondaryCTA" TEXT NOT NULL,

    CONSTRAINT "HeroSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AboutSection" (
    "id" TEXT NOT NULL,
    "aboutKey" TEXT NOT NULL,
    "sectionLabel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ctaButtonText" TEXT NOT NULL,
    "StatisticsNumber" INTEGER NOT NULL,
    "StatisticsLable" TEXT NOT NULL,

    CONSTRAINT "AboutSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HowItWorksSection" (
    "id" TEXT NOT NULL,
    "howToWorksKey" TEXT NOT NULL,
    "sectionLabel" TEXT NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HowItWorksSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HowItWorksStep" (
    "id" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "HowItWorksStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeroSection_heroKay_key" ON "HeroSection"("heroKay");

-- CreateIndex
CREATE UNIQUE INDEX "AboutSection_aboutKey_key" ON "AboutSection"("aboutKey");

-- CreateIndex
CREATE UNIQUE INDEX "HowItWorksSection_howToWorksKey_key" ON "HowItWorksSection"("howToWorksKey");

-- CreateIndex
CREATE UNIQUE INDEX "HowItWorksStep_stepNumber_key" ON "HowItWorksStep"("stepNumber");

-- AddForeignKey
ALTER TABLE "HowItWorksStep" ADD CONSTRAINT "HowItWorksStep_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "HowItWorksSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "elevatorVerifidStatus" AS ENUM ('VERIFID', 'SUSPEND', 'DECLINT', 'REQUEST');

-- AlterTable
ALTER TABLE "Bid" ALTER COLUMN "completionTimeline" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verifidStatus" "elevatorVerifidStatus" NOT NULL DEFAULT 'REQUEST';

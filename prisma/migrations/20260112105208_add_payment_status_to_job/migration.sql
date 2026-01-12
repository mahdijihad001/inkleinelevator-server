-- CreateEnum
CREATE TYPE "JobPaymentStatus" AS ENUM ('PAID', 'UNPAID');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "paymentStatus" "JobPaymentStatus" NOT NULL DEFAULT 'UNPAID';

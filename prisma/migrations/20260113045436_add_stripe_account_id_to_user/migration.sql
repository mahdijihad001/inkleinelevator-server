-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripeAccountId" TEXT,
ALTER COLUMN "isNotification" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "address" JSONB,
ADD COLUMN     "description" JSONB,
ADD COLUMN     "mainColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "workingHours" JSONB;

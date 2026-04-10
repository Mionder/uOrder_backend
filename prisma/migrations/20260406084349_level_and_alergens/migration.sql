-- CreateEnum
CREATE TYPE "Spiciness" AS ENUM ('NONE', 'MEDIUM', 'HOT');

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "spiciness" "Spiciness" NOT NULL DEFAULT 'NONE';

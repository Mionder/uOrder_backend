-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY['uk']::TEXT[];

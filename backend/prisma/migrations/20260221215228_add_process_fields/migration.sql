-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('MANUAL', 'SYSTEMIC');

-- AlterTable
ALTER TABLE "Process" ADD COLUMN     "documentation" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "responsible" TEXT,
ADD COLUMN     "status" "ProcessStatus",
ADD COLUMN     "tools" TEXT;

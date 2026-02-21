-- DropForeignKey
ALTER TABLE "Process" DROP CONSTRAINT "Process_areaId_fkey";

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

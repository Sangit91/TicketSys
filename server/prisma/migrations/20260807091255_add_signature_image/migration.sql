-- AlterEnum
ALTER TYPE "E2EVerificationMethod" ADD VALUE 'SIGNATURE_IMAGE';

-- AlterTable
ALTER TABLE "TicketE2E" ADD COLUMN     "signatureImageUrl" TEXT,
ADD COLUMN     "signedById" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "signatureImageUrl" TEXT;

-- AddForeignKey
ALTER TABLE "TicketE2E" ADD CONSTRAINT "TicketE2E_signedById_fkey" FOREIGN KEY ("signedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

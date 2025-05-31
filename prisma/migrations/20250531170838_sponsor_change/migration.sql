/*
  Warnings:

  - You are about to drop the `_SponsorToTournament` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tournamentId` to the `sponsors` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_SponsorToTournament" DROP CONSTRAINT "_SponsorToTournament_A_fkey";

-- DropForeignKey
ALTER TABLE "_SponsorToTournament" DROP CONSTRAINT "_SponsorToTournament_B_fkey";

-- AlterTable
ALTER TABLE "sponsors" ADD COLUMN     "tournamentId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_SponsorToTournament";

-- AddForeignKey
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

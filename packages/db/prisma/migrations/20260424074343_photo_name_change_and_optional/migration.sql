/*
  Warnings:

  - You are about to drop the column `photot` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "photot",
ADD COLUMN     "photo" TEXT;

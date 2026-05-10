/*
  Warnings:

  - You are about to drop the column `encrypted` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `mfaEnabled` on the `User` table. All the data in the column will be lost.
  - Added the required column `authTag` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cipherText` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iv` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "encrypted",
ADD COLUMN     "algorithm" TEXT NOT NULL DEFAULT 'aes-256-gcm',
ADD COLUMN     "authTag" TEXT NOT NULL,
ADD COLUMN     "cipherText" TEXT NOT NULL,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "destroyedAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "iv" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mfaEnabled",
ADD COLUMN     "emailOtpHash" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "otpLastSentAt" TIMESTAMP(3);

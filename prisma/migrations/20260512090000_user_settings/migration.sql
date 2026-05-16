ALTER TABLE "User"
  ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'system',
  ADD COLUMN "notifyMessages" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "notifySecurity" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "privacyReadReceipts" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "privacyOnlineStatus" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "privacyMessageRequests" BOOLEAN NOT NULL DEFAULT false;

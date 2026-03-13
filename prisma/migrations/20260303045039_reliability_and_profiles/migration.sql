-- AlterTable
ALTER TABLE "Fighter" ADD COLUMN "profileImageUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Coach" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gymId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'COACH',
    "status" TEXT NOT NULL DEFAULT 'ONBOARDING',
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "cancellationRate" REAL NOT NULL DEFAULT 0,
    "noShowRate" REAL NOT NULL DEFAULT 0,
    "responsivenessScore" REAL NOT NULL DEFAULT 0,
    "approvalRate" REAL NOT NULL DEFAULT 0,
    "profileImageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Coach_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Coach" ("createdAt", "email", "fullName", "gymId", "id", "passwordHash", "plan", "role", "status") SELECT "createdAt", "email", "fullName", "gymId", "id", "passwordHash", "plan", "role", "status" FROM "Coach";
DROP TABLE "Coach";
ALTER TABLE "new_Coach" RENAME TO "Coach";
CREATE UNIQUE INDEX "Coach_email_key" ON "Coach"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

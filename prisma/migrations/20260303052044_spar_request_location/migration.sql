-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SparRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromCoachId" TEXT NOT NULL,
    "toCoachId" TEXT NOT NULL,
    "proposedGymId" TEXT,
    "proposedDateTime" DATETIME NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SparRequest_fromCoachId_fkey" FOREIGN KEY ("fromCoachId") REFERENCES "Coach" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SparRequest_toCoachId_fkey" FOREIGN KEY ("toCoachId") REFERENCES "Coach" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SparRequest_proposedGymId_fkey" FOREIGN KEY ("proposedGymId") REFERENCES "Gym" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SparRequest" ("createdAt", "fromCoachId", "id", "message", "proposedDateTime", "status", "toCoachId") SELECT "createdAt", "fromCoachId", "id", "message", "proposedDateTime", "status", "toCoachId" FROM "SparRequest";
DROP TABLE "SparRequest";
ALTER TABLE "new_SparRequest" RENAME TO "SparRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

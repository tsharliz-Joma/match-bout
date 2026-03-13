-- CreateTable
CREATE TABLE "SparRequestFighter" (
    "sparRequestId" TEXT NOT NULL,
    "fighterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("sparRequestId", "fighterId"),
    CONSTRAINT "SparRequestFighter_sparRequestId_fkey" FOREIGN KEY ("sparRequestId") REFERENCES "SparRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SparRequestFighter_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "Fighter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

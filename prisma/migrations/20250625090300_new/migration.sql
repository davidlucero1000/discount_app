/*
  Warnings:

  - Added the required column `shop` to the `Charges` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Charges" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "chargeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "test" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "trialDays" INTEGER NOT NULL,
    "createdAt" TEXT NOT NULL,
    "currentPeriodEnd" TEXT NOT NULL,
    "cancledAt" TEXT
);
INSERT INTO "new_Charges" ("cancledAt", "chargeId", "createdAt", "currentPeriodEnd", "id", "name", "status", "test", "trialDays") SELECT "cancledAt", "chargeId", "createdAt", "currentPeriodEnd", "id", "name", "status", "test", "trialDays" FROM "Charges";
DROP TABLE "Charges";
ALTER TABLE "new_Charges" RENAME TO "Charges";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

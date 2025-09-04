/*
  Warnings:

  - The primary key for the `ChargeItems` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `chargeId` on the `ChargeItems` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `id` on the `ChargeItems` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `Charges` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Charges` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChargeItems" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lineItemId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "interval" TEXT NOT NULL,
    "discount" TEXT,
    "chargeId" INTEGER,
    CONSTRAINT "ChargeItems_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charges" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ChargeItems" ("amount", "chargeId", "currency", "discount", "id", "interval", "lineItemId") SELECT "amount", "chargeId", "currency", "discount", "id", "interval", "lineItemId" FROM "ChargeItems";
DROP TABLE "ChargeItems";
ALTER TABLE "new_ChargeItems" RENAME TO "ChargeItems";
CREATE TABLE "new_Charges" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
INSERT INTO "new_Charges" ("cancledAt", "chargeId", "createdAt", "currentPeriodEnd", "id", "name", "shop", "status", "test", "trialDays") SELECT "cancledAt", "chargeId", "createdAt", "currentPeriodEnd", "id", "name", "shop", "status", "test", "trialDays" FROM "Charges";
DROP TABLE "Charges";
ALTER TABLE "new_Charges" RENAME TO "Charges";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

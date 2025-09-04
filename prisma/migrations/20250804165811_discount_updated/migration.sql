/*
  Warnings:

  - You are about to drop the `Collections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Variants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `collectionId` on the `Discounts` table. All the data in the column will be lost.
  - You are about to drop the column `handle` on the `Discounts` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Discounts` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `Discounts` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Collections";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Products";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Variants";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Discounts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "discountGid" TEXT NOT NULL,
    "title" TEXT,
    "status" TEXT,
    "type" TEXT,
    "collectionIds" TEXT,
    "productIds" TEXT,
    "variantIds" TEXT,
    "startsAt" TEXT,
    "endsAt" TEXT,
    "minimumRequirement" JSONB,
    "customerSelection" JSONB,
    "customerBuys" JSONB,
    "customerGets" JSONB
);
INSERT INTO "new_Discounts" ("discountGid", "id", "shop", "status", "title", "type") SELECT "discountGid", "id", "shop", "status", "title", "type" FROM "Discounts";
DROP TABLE "Discounts";
ALTER TABLE "new_Discounts" RENAME TO "Discounts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

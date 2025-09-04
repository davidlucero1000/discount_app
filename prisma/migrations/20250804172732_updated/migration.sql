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
    "collectionAllProducts" BOOLEAN NOT NULL DEFAULT true,
    "productIds" TEXT,
    "variantIds" TEXT,
    "startsAt" TEXT,
    "endsAt" TEXT,
    "minimumRequirement" JSONB,
    "customerSelection" JSONB,
    "customerBuys" JSONB,
    "customerGets" JSONB
);
INSERT INTO "new_Discounts" ("collectionIds", "customerBuys", "customerGets", "customerSelection", "discountGid", "endsAt", "id", "minimumRequirement", "productIds", "shop", "startsAt", "status", "title", "type", "variantIds") SELECT "collectionIds", "customerBuys", "customerGets", "customerSelection", "discountGid", "endsAt", "id", "minimumRequirement", "productIds", "shop", "startsAt", "status", "title", "type", "variantIds" FROM "Discounts";
DROP TABLE "Discounts";
ALTER TABLE "new_Discounts" RENAME TO "Discounts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

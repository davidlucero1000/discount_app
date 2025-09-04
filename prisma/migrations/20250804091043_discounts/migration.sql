-- CreateTable
CREATE TABLE "Collections" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "collectionGid" TEXT NOT NULL,
    "title" TEXT,
    "handle" TEXT,
    "allProducts" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "productGid" TEXT NOT NULL,
    "title" TEXT,
    "handle" TEXT,
    "allVariants" INTEGER NOT NULL DEFAULT 0,
    "collectionId" INTEGER,
    CONSTRAINT "Products_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collections" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Variants" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "variantGid" TEXT NOT NULL,
    "title" TEXT,
    "handle" TEXT,
    "price" DECIMAL,
    "productId" INTEGER,
    CONSTRAINT "Variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Discounts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "discountGid" TEXT NOT NULL,
    "title" TEXT,
    "handle" TEXT,
    "status" TEXT,
    "collectionId" INTEGER,
    "productId" INTEGER,
    "variantId" INTEGER
);

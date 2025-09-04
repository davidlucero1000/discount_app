-- CreateTable
CREATE TABLE "Charges" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "chargeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "test" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "trialDays" INTEGER NOT NULL,
    "createdAt" TEXT NOT NULL,
    "currentPeriodEnd" TEXT NOT NULL,
    "cancledAt" TEXT
);

-- CreateTable
CREATE TABLE "ChargeItems" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "lineItemId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "interval" TEXT NOT NULL,
    "discount" TEXT,
    "chargeId" BIGINT,
    CONSTRAINT "ChargeItems_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charges" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

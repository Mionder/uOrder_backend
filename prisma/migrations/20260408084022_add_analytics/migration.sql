-- CreateTable
CREATE TABLE "MenuAnalytics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemAnalytics" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ItemAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuAnalytics_tenantId_date_key" ON "MenuAnalytics"("tenantId", "date");

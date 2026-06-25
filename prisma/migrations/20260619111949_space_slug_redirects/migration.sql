-- CreateTable
CREATE TABLE "SpaceSlugRedirect" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "oldSlug" TEXT NOT NULL,
    "spaceId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpaceSlugRedirect_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SpaceSlugRedirect_oldSlug_key" ON "SpaceSlugRedirect"("oldSlug");

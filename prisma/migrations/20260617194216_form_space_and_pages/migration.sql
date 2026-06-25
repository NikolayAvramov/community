-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FormDefinition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT NOT NULL,
    "contentType" TEXT,
    "spaceId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FormDefinition_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FormDefinition" ("contentType", "createdAt", "description", "entityType", "id", "name", "slug", "updatedAt") SELECT "contentType", "createdAt", "description", "entityType", "id", "name", "slug", "updatedAt" FROM "FormDefinition";
DROP TABLE "FormDefinition";
ALTER TABLE "new_FormDefinition" RENAME TO "FormDefinition";
CREATE UNIQUE INDEX "FormDefinition_slug_key" ON "FormDefinition"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

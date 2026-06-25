-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NavigationItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "pageId" INTEGER,
    "parentId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "NavigationItem_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "NavigationItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NavigationItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_NavigationItem" ("href", "id", "isActive", "label", "order", "parentId") SELECT "href", "id", "isActive", "label", "order", "parentId" FROM "NavigationItem";
DROP TABLE "NavigationItem";
ALTER TABLE "new_NavigationItem" RENAME TO "NavigationItem";
CREATE UNIQUE INDEX "NavigationItem_pageId_key" ON "NavigationItem"("pageId");

-- Link existing nav items to CMS pages by matching href (e.g. /kos -> page slug kos)
UPDATE "NavigationItem"
SET "pageId" = (
  SELECT "id" FROM "Page"
  WHERE "Page"."slug" = substr("NavigationItem"."href", 2)
  LIMIT 1
)
WHERE "pageId" IS NULL
  AND "href" LIKE '/%'
  AND EXISTS (
    SELECT 1 FROM "Page"
    WHERE "Page"."slug" = substr("NavigationItem"."href", 2)
  );

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

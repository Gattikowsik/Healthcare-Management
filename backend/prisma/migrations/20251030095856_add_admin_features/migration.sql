/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns with temporary defaults
ALTER TABLE "public"."User" 
ADD COLUMN "firstName" TEXT DEFAULT 'User',
ADD COLUMN "lastName" TEXT DEFAULT 'Name',
ADD COLUMN "username" TEXT DEFAULT 'user',
ADD COLUMN "contact" TEXT,
ADD COLUMN "createdBy" INTEGER,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';

-- Step 2: Update existing users - split name into firstName and lastName, create username
UPDATE "public"."User" 
SET 
  "firstName" = CASE 
    WHEN position(' ' in name) > 0 THEN split_part(name, ' ', 1)
    ELSE name
  END,
  "lastName" = CASE 
    WHEN position(' ' in name) > 0 THEN split_part(name, ' ', 2)
    ELSE ''
  END,
  "username" = LOWER(REPLACE(name, ' ', '_')) || '_' || id::text;

-- Step 3: Make the first user an admin
UPDATE "public"."User" SET "role" = 'admin' WHERE id = 1;

-- Step 4: Drop name column
ALTER TABLE "public"."User" DROP COLUMN "name";

-- Step 5: Remove defaults to make columns required
ALTER TABLE "public"."User" 
ALTER COLUMN "firstName" DROP DEFAULT,
ALTER COLUMN "lastName" DROP DEFAULT,
ALTER COLUMN "username" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "canManagePatients" BOOLEAN NOT NULL DEFAULT true,
    "canManageDoctors" BOOLEAN NOT NULL DEFAULT true,
    "canViewMappings" BOOLEAN NOT NULL DEFAULT true,
    "canCreateMappings" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IssueRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueRequest_pkey" PRIMARY KEY ("id")
);

-- Step 6: Create permissions for existing users
INSERT INTO "public"."Permission" ("userId", "canManagePatients", "canManageDoctors", "canViewMappings", "canCreateMappings")
SELECT id, true, true, true, true FROM "public"."User";

-- CreateIndex
CREATE UNIQUE INDEX "Permission_userId_key" ON "public"."Permission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IssueRequest" ADD CONSTRAINT "IssueRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

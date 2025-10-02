-- Add SUPER_ADMIN role to UserRole enum
DO $$ BEGIN
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create salons table for multi-tenant support
CREATE TABLE IF NOT EXISTS "salons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salons_pkey" PRIMARY KEY ("id")
);

-- Add salonId to professionals table
DO $$ BEGIN
    ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "salonId" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "salons_ownerId_key" ON "salons"("ownerId");
CREATE INDEX IF NOT EXISTS "professionals_salonId_idx" ON "professionals"("salonId");

-- Add foreign keys
DO $$ BEGIN
    ALTER TABLE "salons" ADD CONSTRAINT "salons_ownerId_fkey" 
    FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "professionals" ADD CONSTRAINT "professionals_salonId_fkey" 
    FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

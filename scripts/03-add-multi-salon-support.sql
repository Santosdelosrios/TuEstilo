-- Script para agregar soporte multi-salón al sistema

-- Crear tabla de salones
CREATE TABLE IF NOT EXISTS "salons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "logo" TEXT,
    "ownerId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salons_pkey" PRIMARY KEY ("id")
);

-- Agregar salonId a la tabla users (solo para OWNER)
DO $$ BEGIN
    ALTER TABLE "users" ADD COLUMN "salonId" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Agregar salonId a la tabla professionals
DO $$ BEGIN
    ALTER TABLE "professionals" ADD COLUMN "salonId" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Agregar salonId a la tabla services
DO $$ BEGIN
    ALTER TABLE "services" ADD COLUMN "salonId" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Agregar salonId a la tabla appointments
DO $$ BEGIN
    ALTER TABLE "appointments" ADD COLUMN "salonId" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS "salons_ownerId_idx" ON "salons"("ownerId");
CREATE INDEX IF NOT EXISTS "users_salonId_idx" ON "users"("salonId");
CREATE INDEX IF NOT EXISTS "professionals_salonId_idx" ON "professionals"("salonId");
CREATE INDEX IF NOT EXISTS "services_salonId_idx" ON "services"("salonId");
CREATE INDEX IF NOT EXISTS "appointments_salonId_idx" ON "appointments"("salonId");

-- Agregar foreign keys
DO $$ BEGIN
    ALTER TABLE "salons" ADD CONSTRAINT "salons_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "users" ADD CONSTRAINT "users_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "professionals" ADD CONSTRAINT "professionals_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "services" ADD CONSTRAINT "services_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "appointments" ADD CONSTRAINT "appointments_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "salons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

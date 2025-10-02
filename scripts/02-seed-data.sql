-- Added ON CONFLICT DO NOTHING to all INSERT statements to make script idempotent
-- Updated password hashes to use SHA-256 instead of bcrypt
-- All demo users have password: "password123"
-- SHA-256 hash: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

-- Insert demo users
INSERT INTO "users" ("id", "name", "email", "password", "role", "phone", "createdAt", "updatedAt") VALUES
('owner-1', 'Carlos Mendez', 'owner@salon.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'OWNER', '+54 11 1234-5678', NOW(), NOW()),
('staff-1', 'Maria Garcia', 'staff@salon.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'STAFF', '+54 11 2345-6789', NOW(), NOW()),
('staff-2', 'Juan Lopez', 'juan@salon.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'STAFF', '+54 11 3456-7890', NOW(), NOW()),
('customer-1', 'Ana Rodriguez', 'ana@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'CUSTOMER', '+54 11 4567-8901', NOW(), NOW()),
('customer-2', 'Pedro Martinez', 'pedro@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'CUSTOMER', '+54 11 5678-9012', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert professionals
INSERT INTO "professionals" ("id", "userId", "bio", "specialties", "available", "createdAt", "updatedAt") VALUES
('prof-1', 'staff-1', 'Especialista en cortes modernos y coloración', ARRAY['Corte', 'Coloración', 'Peinados'], true, NOW(), NOW()),
('prof-2', 'staff-2', 'Experto en barbería clásica y afeitado', ARRAY['Barbería', 'Afeitado', 'Barba'], true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert services
INSERT INTO "services" ("id", "name", "description", "durationMinutes", "price", "professionalId", "active", "createdAt", "updatedAt") VALUES
('serv-1', 'Corte de Cabello', 'Corte profesional con lavado incluido', 45, 5000, 'prof-1', true, NOW(), NOW()),
('serv-2', 'Coloración', 'Coloración completa con productos premium', 120, 12000, 'prof-1', true, NOW(), NOW()),
('serv-3', 'Peinado', 'Peinado para eventos especiales', 60, 6000, 'prof-1', true, NOW(), NOW()),
('serv-4', 'Corte + Barba', 'Corte de cabello y arreglo de barba', 60, 6500, 'prof-2', true, NOW(), NOW()),
('serv-5', 'Afeitado Clásico', 'Afeitado tradicional con toalla caliente', 30, 3500, 'prof-2', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample appointments
INSERT INTO "appointments" ("id", "customerId", "professionalId", "serviceId", "startTime", "endTime", "status", "notes", "createdAt", "updatedAt") VALUES
('appt-1', 'customer-1', 'prof-1', 'serv-1', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '45 minutes', 'CONFIRMED', 'Cliente prefiere corte corto', NOW(), NOW()),
('appt-2', 'customer-2', 'prof-2', 'serv-4', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '60 minutes', 'PENDING', NULL, NOW(), NOW()),
('appt-3', 'customer-1', 'prof-1', 'serv-2', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '120 minutes', 'COMPLETED', 'Coloración castaño claro', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert payments
INSERT INTO "payments" ("id", "appointmentId", "amount", "status", "paymentMethod", "createdAt", "updatedAt") VALUES
('pay-1', 'appt-3', 12000, 'PAID', 'Efectivo', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

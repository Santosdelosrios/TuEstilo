-- Create first super admin user
-- IMPORTANT: Change the email and password after running this script!

DO $$
DECLARE
    admin_id TEXT := gen_random_uuid()::TEXT;
    admin_email TEXT := 'admin@tudominio.com'; -- CAMBIAR ESTE EMAIL
    -- Password: Admin123! (CAMBIAR DESPUÉS DE CREAR)
    admin_password TEXT := '$2a$10$YourHashedPasswordHere'; -- Hash de bcrypt
BEGIN
    -- Check if super admin already exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'SUPER_ADMIN') THEN
        INSERT INTO users (id, name, email, password, role, "createdAt", "updatedAt")
        VALUES (
            admin_id,
            'Super Administrador',
            admin_email,
            admin_password,
            'SUPER_ADMIN',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Super admin creado con email: %', admin_email;
        RAISE NOTICE 'IMPORTANTE: Cambia la contraseña después del primer inicio de sesión';
    ELSE
        RAISE NOTICE 'Ya existe un super admin en el sistema';
    END IF;
END $$;

-- =============================================
-- TYPES ENUM
-- =============================================
CREATE TYPE app_role AS ENUM ('admin', 'doctor', 'secretary', 'patient', 'nurse', 'accountant', 'supervisor');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE resource_type AS ENUM ('room', 'equipment');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE notification_type AS ENUM ('reminder', 'confirmation', 'cancellation', 'update');

-- =============================================
-- TABLE 1: profiles (Utilisateurs)
-- =============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    avatar_url TEXT,
    department VARCHAR(100),
    job_title VARCHAR(100),
    employee_id VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 2: user_roles
-- =============================================
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'patient',
    UNIQUE(user_id, role)
);

-- =============================================
-- TABLE 3: permissions
-- =============================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    module VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 4: role_permissions
-- =============================================
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role app_role NOT NULL,
    permission_code VARCHAR(100) NOT NULL REFERENCES permissions(code),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, permission_code)
);

-- =============================================
-- TABLE 5: departments
-- =============================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    head_user_id UUID REFERENCES profiles(id),
    parent_department_id UUID REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 6: patients
-- =============================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_type VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    nationality VARCHAR(100),
    occupation VARCHAR(100),
    marital_status VARCHAR(50),
    preferred_language VARCHAR(20) DEFAULT 'Français',
    social_security_number VARCHAR(100),
    insurance_provider VARCHAR(200),
    insurance_number VARCHAR(100),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(50),
    allergies TEXT,
    medical_notes TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_user_id ON patients(user_id);

-- =============================================
-- TABLE 7: practitioners
-- =============================================
CREATE TABLE practitioners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    specialty VARCHAR(200) NOT NULL,
    title VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    bio TEXT,
    education TEXT,
    license_number VARCHAR(100),
    consultation_fee DECIMAL(12,2),
    years_of_experience INTEGER,
    languages TEXT[] DEFAULT ARRAY['Français'],
    calendar_color VARCHAR(50) DEFAULT '#3B82F6',
    profile_image_url TEXT,
    accepts_new_patients BOOLEAN DEFAULT true,
    max_patients_per_day INTEGER,
    appointment_buffer_minutes INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 8: practitioner_schedules
-- =============================================
CREATE TABLE practitioner_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true
);

-- =============================================
-- TABLE 9: practitioner_absences
-- =============================================
CREATE TABLE practitioner_absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 10: practitioner_guards
-- =============================================
CREATE TABLE practitioner_guards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
    guard_date DATE NOT NULL,
    start_time TIME NOT NULL DEFAULT '18:00',
    end_time TIME NOT NULL DEFAULT '08:00',
    guard_type VARCHAR(50) NOT NULL DEFAULT 'night',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 11: appointment_types
-- =============================================
CREATE TABLE appointment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    color VARCHAR(50) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 12: resources
-- =============================================
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type resource_type NOT NULL,
    description TEXT,
    location VARCHAR(200),
    floor VARCHAR(50),
    capacity INTEGER,
    is_available BOOLEAN DEFAULT true,
    maintenance_required BOOLEAN DEFAULT false,
    assigned_practitioner_id UUID REFERENCES practitioners(id),
    manufacturer VARCHAR(200),
    model VARCHAR(200),
    serial_number VARCHAR(100),
    purchase_date DATE,
    warranty_expiry_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    cost_per_hour DECIMAL(10,2) DEFAULT 0,
    contact_person VARCHAR(200),
    contact_phone VARCHAR(50),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 13: resource_schedules
-- =============================================
CREATE TABLE resource_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 14: resource_bookings
-- =============================================
CREATE TABLE resource_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id),
    practitioner_id UUID REFERENCES practitioners(id),
    appointment_id UUID,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 15: resource_maintenance_logs
-- =============================================
CREATE TABLE resource_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id),
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    maintenance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_scheduled_date DATE,
    performed_by VARCHAR(200),
    cost DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 16: appointments
-- =============================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    practitioner_id UUID NOT NULL REFERENCES practitioners(id),
    appointment_type_id UUID REFERENCES appointment_types(id),
    resource_id UUID REFERENCES resources(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status appointment_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_date ON appointments(scheduled_at);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_practitioner ON appointments(practitioner_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- =============================================
-- TABLE 17: consultation_notes
-- =============================================
CREATE TABLE consultation_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id),
    practitioner_id UUID NOT NULL REFERENCES practitioners(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    parent_consultation_id UUID REFERENCES consultation_notes(id),
    consultation_number INTEGER DEFAULT 1,
    consultation_type VARCHAR(100) DEFAULT 'initial',
    chief_complaint TEXT,
    history_present_illness TEXT,
    examination_findings TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    prescriptions TEXT,
    vital_signs JSONB,
    follow_up_notes TEXT,
    follow_up_date DATE,
    is_closed BOOLEAN DEFAULT false,
    closed_at TIMESTAMPTZ,
    closed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 18: billable_items
-- =============================================
CREATE TABLE billable_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    category VARCHAR(100) DEFAULT 'service',
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 19: invoices
-- =============================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    practitioner_id UUID REFERENCES practitioners(id),
    appointment_id UUID REFERENCES appointments(id),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    amount_due DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'XOF',
    is_deferred BOOLEAN DEFAULT false,
    installment_count INTEGER DEFAULT 1,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- =============================================
-- TABLE 20: invoice_items
-- =============================================
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    billable_item_id UUID REFERENCES billable_items(id),
    description VARCHAR(500) NOT NULL,
    service_code VARCHAR(50),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 21: invoice_installments
-- =============================================
CREATE TABLE invoice_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    paid_amount DECIMAL(12,2) DEFAULT 0,
    paid_at TIMESTAMPTZ,
    payment_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 22: payments
-- =============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number VARCHAR(50) NOT NULL,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    payment_date DATE DEFAULT CURRENT_DATE,
    reference VARCHAR(200),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'completed',
    currency VARCHAR(10) DEFAULT 'XOF',
    received_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK for installments
ALTER TABLE invoice_installments ADD CONSTRAINT fk_installments_payment 
    FOREIGN KEY (payment_id) REFERENCES payments(id);

-- =============================================
-- TABLE 23: queue_entries
-- =============================================
CREATE TABLE queue_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    practitioner_id UUID REFERENCES practitioners(id),
    appointment_id UUID REFERENCES appointments(id),
    resource_id UUID REFERENCES resources(id),
    queue_number SERIAL,
    priority INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'waiting',
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    called_time TIMESTAMPTZ,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    estimated_wait_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 24: queue_settings
-- =============================================
CREATE TABLE queue_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID REFERENCES practitioners(id),
    resource_id UUID REFERENCES resources(id),
    average_service_time_minutes INTEGER DEFAULT 15,
    max_queue_size INTEGER,
    auto_call_enabled BOOLEAN DEFAULT false,
    display_position_to_patient BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 25: notifications & notifications_log
-- =============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id),
    type notification_type NOT NULL,
    status notification_status DEFAULT 'pending',
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    patient_id UUID REFERENCES patients(id),
    type VARCHAR(100) NOT NULL,
    title VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 26: patient_documents
-- =============================================
CREATE TABLE patient_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    file_name VARCHAR(500) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER,
    document_type VARCHAR(100) DEFAULT 'other',
    description TEXT,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 27: activity_logs
-- =============================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    entity_name VARCHAR(300),
    old_data JSONB,
    new_data JSONB,
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_date ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- =============================================
-- TABLE 28: settings
-- =============================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 29: currencies
-- =============================================
CREATE TABLE currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimal_places INTEGER DEFAULT 2,
    decimal_separator VARCHAR(5) DEFAULT ',',
    thousands_separator VARCHAR(5) DEFAULT ' ',
    symbol_position VARCHAR(10) DEFAULT 'after',
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    exchange_rate DECIMAL(12,4) DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 30: chat_messages
-- =============================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id),
    recipient_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DONNÉES INITIALES
-- =============================================

-- Permissions par défaut
INSERT INTO permissions (code, name, module) VALUES
('patients.view', 'Voir les patients', 'patients'),
('patients.create', 'Créer des patients', 'patients'),
('patients.edit', 'Modifier les patients', 'patients'),
('patients.delete', 'Supprimer des patients', 'patients'),
('appointments.view', 'Voir les rendez-vous', 'appointments'),
('appointments.create', 'Créer des rendez-vous', 'appointments'),
('appointments.edit', 'Modifier les rendez-vous', 'appointments'),
('appointments.delete', 'Supprimer des rendez-vous', 'appointments'),
('invoices.view', 'Voir les factures', 'invoices'),
('invoices.create', 'Créer des factures', 'invoices'),
('invoices.edit', 'Modifier les factures', 'invoices'),
('queue.manage', 'Gérer la file d''attente', 'queue'),
('resources.manage', 'Gérer les ressources', 'resources'),
('settings.manage', 'Gérer les paramètres', 'settings'),
('users.manage', 'Gérer les utilisateurs', 'users'),
('activity_logs.view', 'Voir les journaux', 'activity_logs');

-- Admin a toutes les permissions
INSERT INTO role_permissions (role, permission_code)
SELECT 'admin', code FROM permissions;

-- Devise par défaut
INSERT INTO currencies (code, name, symbol, decimal_places, is_default) 
VALUES ('XOF', 'Franc CFA (BCEAO)', 'FCFA', 0, true);

-- Paramètres initiaux
INSERT INTO settings (key, value) VALUES
('company', '{"name": "Ma Clinique", "city": "Abidjan", "phone": "", "email": ""}'),
('working_hours', '{"start_time": "08:00", "end_time": "18:00", "working_days": [1,2,3,4,5]}'),
('appointments', '{"default_duration": 30, "time_slot_interval": 15}'),
('display', '{"theme": "system", "language": "fr", "date_format": "dd/MM/yyyy"}'),
('security', '{"password_min_length": 8, "session_timeout_minutes": 480}');

-- File d'attente par défaut
INSERT INTO queue_settings (average_service_time_minutes, max_queue_size) 
VALUES (15, 50);
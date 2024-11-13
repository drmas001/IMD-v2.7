-- First, drop existing types if they exist
DROP TYPE IF EXISTS shift_type CASCADE;
DROP TYPE IF EXISTS safety_type CASCADE;
DROP TYPE IF EXISTS note_type CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS active_admissions CASCADE;
DROP VIEW IF EXISTS discharged_patients CASCADE;

-- Create enum types
DO $$ 
BEGIN
    -- Create shift_type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shift_type') THEN
        CREATE TYPE shift_type AS ENUM (
            'morning',
            'evening',
            'night',
            'weekend_morning',
            'weekend_night'
        );
    END IF;

    -- Create safety_type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'safety_type') THEN
        CREATE TYPE safety_type AS ENUM (
            'emergency',
            'observation',
            'short-stay'
        );
    END IF;

    -- Create note_type enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'note_type') THEN
        CREATE TYPE note_type AS ENUM (
            'Progress Note',
            'Follow-up Note',
            'Consultation Note',
            'Discharge Note',
            'Discharge Summary'
        );
    END IF;
END $$;

-- Create users table first since other tables reference it
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    medical_code VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('doctor', 'nurse', 'administrator')) NOT NULL,
    department VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    mrn VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admissions table with explicit foreign key references and constraints
CREATE TABLE IF NOT EXISTS admissions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    admission_date TIMESTAMP WITH TIME ZONE NOT NULL,
    discharge_date TIMESTAMP WITH TIME ZONE,
    department VARCHAR(255) NOT NULL,
    admitting_doctor_id INTEGER NOT NULL,
    discharge_doctor_id INTEGER,
    diagnosis TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'discharged', 'transferred')) NOT NULL,
    safety_type safety_type,
    shift_type shift_type NOT NULL DEFAULT 'morning',
    is_weekend BOOLEAN DEFAULT false,
    visit_number INTEGER NOT NULL DEFAULT 1,
    discharge_type VARCHAR(50) CHECK (discharge_type IN ('regular', 'against-medical-advice', 'transfer')),
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    discharge_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) 
        REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_admitting_doctor FOREIGN KEY (admitting_doctor_id) 
        REFERENCES users(id),
    CONSTRAINT fk_discharge_doctor FOREIGN KEY (discharge_doctor_id) 
        REFERENCES users(id)
);

-- Create consultations table with explicit foreign key references
CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    mrn VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    requesting_department VARCHAR(255) NOT NULL,
    patient_location VARCHAR(255) NOT NULL,
    consultation_specialty VARCHAR(255) NOT NULL,
    shift_type VARCHAR(10) CHECK (shift_type IN ('morning', 'evening', 'night')),
    urgency VARCHAR(10) CHECK (urgency IN ('routine', 'urgent', 'emergency')),
    reason TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'cancelled')),
    consulting_doctor_id INTEGER,
    completed_by_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_note TEXT,
    response_time INTEGER,
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) 
        REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_consulting_doctor FOREIGN KEY (consulting_doctor_id) 
        REFERENCES users(id),
    CONSTRAINT fk_completed_by FOREIGN KEY (completed_by_id) 
        REFERENCES users(id)
);

-- Create medical_notes table with explicit foreign key references
CREATE TABLE IF NOT EXISTS medical_notes (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    note_type note_type NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) 
        REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) 
        REFERENCES users(id)
);

-- Create long_stay_notes table with explicit foreign key references
CREATE TABLE IF NOT EXISTS long_stay_notes (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_by_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) 
        REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by_id) 
        REFERENCES users(id)
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    medical_number VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    appointment_type VARCHAR(10) CHECK (appointment_type IN ('routine', 'urgent')),
    notes TEXT,
    status VARCHAR(10) CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create vital_signs table with explicit foreign key references
CREATE TABLE IF NOT EXISTS vital_signs (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    recorded_by_id INTEGER NOT NULL,
    temperature DECIMAL(4,1),
    heart_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    respiratory_rate INTEGER,
    oxygen_saturation INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) 
        REFERENCES patients(id) ON DELETE CASCADE,
    CONSTRAINT fk_recorded_by FOREIGN KEY (recorded_by_id) 
        REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(mrn);
CREATE INDEX IF NOT EXISTS idx_admissions_patient_id ON admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_admitting_doctor ON admissions(admitting_doctor_id);
CREATE INDEX IF NOT EXISTS idx_admissions_discharge_doctor ON admissions(discharge_doctor_id);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_safety_type ON admissions(safety_type) WHERE safety_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admissions_shift_type ON admissions(shift_type);
CREATE INDEX IF NOT EXISTS idx_admissions_discharge ON admissions(discharge_date) WHERE discharge_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_consulting_doctor ON consultations(consulting_doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_completed_by ON consultations(completed_by_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_medical_notes_patient_id ON medical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_notes_doctor_id ON medical_notes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_long_stay_notes_patient_id ON long_stay_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_long_stay_notes_created_by ON long_stay_notes(created_by_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient_id ON vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_recorded_by ON vital_signs(recorded_by_id);

-- Create view for active admissions with explicit joins
CREATE OR REPLACE VIEW active_admissions AS
SELECT 
    a.id,
    a.patient_id,
    p.mrn,
    p.name AS patient_name,
    a.admission_date,
    a.department,
    a.safety_type::text as safety_type,
    a.shift_type::text as shift_type,
    a.is_weekend,
    ad.name AS admitting_doctor_name,
    dd.name AS discharge_doctor_name,
    a.diagnosis,
    a.status,
    a.visit_number
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users ad ON a.admitting_doctor_id = ad.id
    LEFT JOIN users dd ON a.discharge_doctor_id = dd.id
WHERE 
    a.status = 'active';

-- Create view for discharged patients with explicit joins
CREATE OR REPLACE VIEW discharged_patients AS
SELECT 
    a.id,
    a.patient_id,
    p.mrn,
    p.name AS patient_name,
    a.admission_date,
    a.discharge_date,
    a.department,
    a.discharge_type,
    a.follow_up_required,
    a.follow_up_date,
    a.discharge_note,
    ad.name AS admitting_doctor_name,
    dd.name AS discharge_doctor_name
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users ad ON a.admitting_doctor_id = ad.id
    LEFT JOIN users dd ON a.discharge_doctor_id = dd.id
WHERE 
    a.status = 'discharged';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
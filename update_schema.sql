-- Update admissions table to include users reference and shift type
ALTER TABLE admissions
ADD COLUMN IF NOT EXISTS shift_type VARCHAR(20) CHECK (
  shift_type IN ('morning', 'evening', 'night', 'weekend_morning', 'weekend_night')
),
ADD COLUMN IF NOT EXISTS is_weekend BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admitting_doctor_id INTEGER REFERENCES users(id);

-- Add foreign key for doctor reference
ALTER TABLE admissions
ADD CONSTRAINT fk_admitting_doctor
FOREIGN KEY (admitting_doctor_id)
REFERENCES users(id)
ON DELETE SET NULL;

-- Update consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS doctor_id INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255);

-- Update long_stay_notes table
DROP TABLE IF EXISTS long_stay_notes;
CREATE TABLE long_stay_notes (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admissions_doctor ON admissions(admitting_doctor_id);
CREATE INDEX IF NOT EXISTS idx_admissions_shift_type ON admissions(shift_type);
CREATE INDEX IF NOT EXISTS idx_admissions_weekend ON admissions(is_weekend);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_long_stay_notes_patient ON long_stay_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_long_stay_notes_created_by ON long_stay_notes(created_by);

-- Drop existing view if it exists
DROP VIEW IF EXISTS active_admissions;

-- Create view for active admissions with doctor info
CREATE VIEW active_admissions AS
SELECT 
    a.id,
    a.patient_id,
    p.mrn,
    p.name,
    a.admission_date,
    a.department,
    a.diagnosis,
    a.status,
    a.safety_type,
    a.shift_type,
    a.is_weekend,
    u.id as doctor_id,
    u.name as doctor_name
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users u ON a.admitting_doctor_id = u.id
WHERE 
    a.status = 'active';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to long_stay_notes
CREATE TRIGGER update_long_stay_notes_updated_at
    BEFORE UPDATE ON long_stay_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON long_stay_notes TO authenticated;
GRANT USAGE ON SEQUENCE long_stay_notes_id_seq TO authenticated;
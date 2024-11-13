-- Add discharge-related columns to admissions table
ALTER TABLE admissions
ADD COLUMN IF NOT EXISTS discharge_type VARCHAR(50) CHECK (discharge_type IN ('regular', 'against-medical-advice', 'transfer')),
ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS follow_up_date DATE,
ADD COLUMN IF NOT EXISTS discharge_note TEXT;

-- Create index for discharge-related queries
CREATE INDEX IF NOT EXISTS idx_admissions_discharge_type ON admissions(discharge_type) WHERE discharge_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admissions_follow_up ON admissions(follow_up_date) WHERE follow_up_required = true;

-- Create view for discharged patients
CREATE OR REPLACE VIEW discharged_patients AS
SELECT 
    a.id,
    a.patient_id,
    p.mrn,
    p.name,
    a.admission_date,
    a.discharge_date,
    a.department,
    a.discharge_type,
    a.follow_up_required,
    a.follow_up_date,
    a.discharge_note,
    u.name as doctor_name
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users u ON a.admitting_doctor_id = u.id
WHERE 
    a.status = 'discharged';
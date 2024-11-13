-- Add discharge_doctor_id column to admissions table
ALTER TABLE admissions
ADD COLUMN IF NOT EXISTS discharge_doctor_id INTEGER REFERENCES users(id);

-- Create index for discharge_doctor_id
CREATE INDEX IF NOT EXISTS idx_admissions_discharge_doctor 
ON admissions(discharge_doctor_id) 
WHERE discharge_doctor_id IS NOT NULL;

-- Update views to include discharge doctor information
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
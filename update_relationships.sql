-- Drop existing foreign key constraints if they exist
ALTER TABLE admissions 
  DROP CONSTRAINT IF EXISTS admissions_patient_id_fkey,
  DROP CONSTRAINT IF EXISTS admissions_admitting_doctor_id_fkey,
  DROP CONSTRAINT IF EXISTS admissions_discharge_doctor_id_fkey;

-- Add foreign key constraints with explicit names
ALTER TABLE admissions
  ADD CONSTRAINT admissions_patient_id_fkey 
    FOREIGN KEY (patient_id) 
    REFERENCES patients(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT admissions_admitting_doctor_id_fkey 
    FOREIGN KEY (admitting_doctor_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL,
  ADD CONSTRAINT admissions_discharge_doctor_id_fkey 
    FOREIGN KEY (discharge_doctor_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admissions_patient_id 
  ON admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_admitting_doctor 
  ON admissions(admitting_doctor_id);
CREATE INDEX IF NOT EXISTS idx_admissions_discharge_doctor 
  ON admissions(discharge_doctor_id);

-- Update or create the active_admissions view with proper joins
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

-- Update or create the discharged_patients view with proper joins
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
GRANT SELECT ON active_admissions TO authenticated;
GRANT SELECT ON discharged_patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admissions TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
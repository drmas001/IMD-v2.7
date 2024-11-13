-- Drop existing views
DROP VIEW IF EXISTS active_admissions;
DROP VIEW IF EXISTS discharged_patients;

-- Recreate active_admissions view with consistent column names
CREATE VIEW active_admissions AS
SELECT 
    a.id,
    a.patient_id,
    p.mrn,
    p.name,
    a.admission_date,
    a.department,
    a.safety_type::text as safety_type,
    a.shift_type::text as shift_type,
    a.is_weekend,
    ad.name as admitting_doctor_name,
    dd.name as discharge_doctor_name,
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

-- Recreate discharged_patients view with consistent column names
CREATE VIEW discharged_patients AS
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
    ad.name as admitting_doctor_name,
    dd.name as discharge_doctor_name
FROM 
    admissions a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users ad ON a.admitting_doctor_id = ad.id
    LEFT JOIN users dd ON a.discharge_doctor_id = dd.id
WHERE 
    a.status = 'discharged';
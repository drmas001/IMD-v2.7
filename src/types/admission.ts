export interface Admission {
  id: number;
  patient_id: number;
  admitting_doctor_id: number;
  discharge_doctor_id?: number;
  status: 'active' | 'discharged' | 'transferred';
  department: string;
  admission_date: string;
  discharge_date: string | null;
  diagnosis: string;
  visit_number: number;
  safety_type?: 'emergency' | 'observation' | 'short-stay';
  shift_type: 'morning' | 'evening' | 'night' | 'weekend_morning' | 'weekend_night';
  is_weekend: boolean;
  admitting_doctor?: {
    name: string;
  };
  discharge_doctor?: {
    name: string;
  };
}
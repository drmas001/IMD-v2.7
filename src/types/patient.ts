export interface Patient {
  id: number;
  mrn: string;
  name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  department?: string;
  doctor_name?: string;
  diagnosis?: string;
  admission_date?: string;
  admissions?: Array<{
    id: number;
    status: 'active' | 'discharged' | 'transferred';
    admission_date: string;
    discharge_date: string | null;
    department: string;
    diagnosis: string;
    visit_number: number;
    safety_type?: 'emergency' | 'observation' | 'short-stay' | null;
    users?: {
      name: string;
    };
  }>;
}
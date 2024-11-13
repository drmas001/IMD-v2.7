export interface User {
  id: number;
  medical_code: string;
  name: string;
  role: 'doctor' | 'nurse' | 'administrator';
  department: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}
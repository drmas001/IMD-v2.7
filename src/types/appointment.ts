export interface Appointment {
  id: number;
  patientName: string;
  medicalNumber: string;
  specialty: string;
  appointmentType: 'routine' | 'urgent';
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}
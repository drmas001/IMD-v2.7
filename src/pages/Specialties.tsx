import React, { useState } from 'react';
import { Users, Heart, PlusSquare, Activity, Calendar as CalendarIcon, Clock as ClockIcon, Share2, Copy, Check } from 'lucide-react';
import { usePatientStore } from '../stores/usePatientStore';
import { useConsultationStore } from '../stores/useConsultationStore';
import { useAppointmentStore } from '../stores/useAppointmentStore';
import { formatDate } from '../utils/dateFormat';
import type { Patient } from '../types/patient';
import type { Consultation } from '../types/consultation';
import type { Appointment } from '../types/appointment';

interface SpecialtiesProps {
  onNavigateToPatient: () => void;
  selectedSpecialty?: string;
}

const isAppointment = (item: Patient | Appointment): item is Appointment => {
  return 'patientName' in item;
};

const Specialties: React.FC<SpecialtiesProps> = ({ onNavigateToPatient, selectedSpecialty }) => {
  const { patients, setSelectedPatient } = usePatientStore();
  const { consultations } = useConsultationStore();
  const { appointments } = useAppointmentStore();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredPatients = patients.filter(patient => 
    patient.admissions?.some(admission => 
      (!selectedSpecialty || admission.department === selectedSpecialty) && 
      admission.status === 'active'
    )
  );

  const filteredConsultations = consultations.filter(consultation => 
    (!selectedSpecialty || consultation.consultation_specialty === selectedSpecialty) && 
    consultation.status === 'active'
  );

  const upcomingAppointments = appointments.filter(appointment =>
    (!selectedSpecialty || appointment.specialty === selectedSpecialty) &&
    appointment.status === 'pending'
  );

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    onNavigateToPatient();
  };

  const handleConsultationClick = (consultation: Consultation) => {
    const admissionDate = new Date(consultation.created_at);
    const dayOfWeek = admissionDate.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday

    const admission = {
      id: consultation.id,
      patient_id: consultation.patient_id,
      admitting_doctor_id: consultation.doctor_id || 0,
      status: 'active' as const,
      department: consultation.consultation_specialty,
      admission_date: consultation.created_at,
      discharge_date: null,
      diagnosis: consultation.reason,
      visit_number: 1,
      shift_type: isWeekend ? 'weekend_morning' as const : 'morning' as const,
      is_weekend: isWeekend,
      users: consultation.doctor_name ? { name: consultation.doctor_name } : undefined
    };

    const consultationPatient: Patient = {
      id: consultation.id,
      mrn: consultation.mrn,
      name: consultation.patient_name,
      gender: consultation.gender,
      date_of_birth: new Date(new Date().getFullYear() - consultation.age, 0, 1).toISOString(),
      department: consultation.consultation_specialty,
      doctor_name: consultation.doctor_name,
      diagnosis: consultation.reason,
      admission_date: consultation.created_at,
      admissions: [admission]
    };

    setSelectedPatient(consultationPatient);
    onNavigateToPatient();
  };

  const handleAppointmentClick = () => {
    const event = new CustomEvent('navigate', { 
      detail: 'appointments'
    });
    window.dispatchEvent(event);
  };

  const formatShareText = (item: Patient | Appointment): string => {
    if (isAppointment(item)) {
      return `
Appointment for ${item.patientName}
MRN: ${item.medicalNumber}
Specialty: ${item.specialty}
Date: ${formatDate(item.createdAt)}
Type: ${item.appointmentType}
      `.trim();
    }

    const admission = item.admissions?.[0];
    return `
Patient: ${item.name}
MRN: ${item.mrn}
Department: ${admission?.department || 'N/A'}
Doctor: ${admission?.users?.name || 'Not assigned'}
Admission Date: ${formatDate(admission?.admission_date || '')}
    `.trim();
  };

  const handleShare = async (item: Patient | Appointment) => {
    const shareText = formatShareText(item);

    try {
      if (navigator.canShare?.({ text: shareText })) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="flex-1 p-6">
      {/* Rest of the component implementation */}
    </div>
  );
};

export default Specialties;
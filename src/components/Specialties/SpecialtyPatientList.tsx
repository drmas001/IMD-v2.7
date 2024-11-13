import React from 'react';
import { User, Calendar, Stethoscope } from 'lucide-react';
import { usePatientStore } from '../../stores/usePatientStore';
import { useConsultationStore } from '../../stores/useConsultationStore';
import type { Patient } from '../../types/patient';
import type { Consultation } from '../../types/consultation';

interface SpecialtyPatientListProps {
  onNavigateToPatient: () => void;
}

interface PatientAdmission {
  id: number;
  status: 'active' | 'discharged' | 'transferred';
  department: string;
  admission_date: string;
  discharge_date: string | null;
  diagnosis: string;
  visit_number: number;
  admitting_doctor_id: number;
  safety_type?: 'emergency' | 'observation' | 'short-stay';
  users?: {
    name: string;
  };
}

const SpecialtyPatientList: React.FC<SpecialtyPatientListProps> = ({ onNavigateToPatient }) => {
  const { consultations } = useConsultationStore();
  const { setSelectedPatient } = usePatientStore();

  const handlePatientClick = (consultation: Consultation) => {
    // Transform consultation data into patient data
    const admission: PatientAdmission = {
      id: consultation.id,
      status: 'active',
      department: consultation.consultation_specialty,
      admission_date: consultation.created_at,
      discharge_date: null,
      diagnosis: consultation.reason,
      visit_number: 1,
      admitting_doctor_id: consultation.doctor_id || 0,
      users: consultation.doctor_name ? { name: consultation.doctor_name } : undefined
    };

    const patientData: Patient = {
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

    setSelectedPatient(patientData);
    onNavigateToPatient();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Patient List</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {consultations.map((consultation) => (
          <div
            key={consultation.id}
            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => handlePatientClick(consultation)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{consultation.patient_name}</h3>
                  <p className="text-sm text-gray-600">MRN: {consultation.mrn}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(consultation.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      {consultation.doctor_name || 'Pending Assignment'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Consultation
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  consultation.urgency === 'emergency'
                    ? 'bg-red-100 text-red-800'
                    : consultation.urgency === 'urgent'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {consultation.urgency}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialtyPatientList;
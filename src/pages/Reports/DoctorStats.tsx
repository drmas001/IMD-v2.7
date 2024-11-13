import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUserStore } from '../../stores/useUserStore';
import { usePatientStore } from '../../stores/usePatientStore';
import { useConsultationStore } from '../../stores/useConsultationStore';
import type { User } from '../../types/user';
import type { Patient } from '../../types/patient';
import type { Consultation } from '../../types/consultation';

interface DoctorStatsProps {
  dateFilter: {
    startDate: string;
    endDate: string;
    period: string;
  };
}

interface DoctorData {
  name: string;
  patients: number;
  consultations: number;
  department: string;
}

const VALID_SPECIALTIES = [
  'Internal Medicine',
  'Pulmonology',
  'Neurology',
  'Gastroenterology',
  'Rheumatology',
  'Endocrinology',
  'Hematology',
  'Infectious Disease',
  'Thrombosis Medicine',
  'Immunology & Allergy'
] as const;

const DoctorStats: React.FC<DoctorStatsProps> = ({ dateFilter }) => {
  const { users } = useUserStore();
  const { patients } = usePatientStore();
  const { consultations } = useConsultationStore();

  const doctors = users.filter((user: User) => 
    user.role === 'doctor' && 
    user.status === 'active'
  );

  const getDoctorData = (): DoctorData[] => {
    return doctors.map(doctor => {
      const activePatients = patients.filter((patient: Patient) => {
        const admissions = patient.admissions;
        return admissions?.some(admission => 
          admission.admitting_doctor_id === doctor.id &&
          admission.status === 'active' &&
          new Date(admission.admission_date) >= new Date(dateFilter.startDate) &&
          new Date(admission.admission_date) <= new Date(dateFilter.endDate)
        );
      }).length;

      const pendingConsultations = consultations.filter((consultation: Consultation) =>
        consultation.doctor_id === doctor.id &&
        consultation.status === 'active' &&
        new Date(consultation.created_at) >= new Date(dateFilter.startDate) &&
        new Date(consultation.created_at) <= new Date(dateFilter.endDate)
      ).length;

      return {
        name: doctor.name,
        patients: activePatients,
        consultations: pendingConsultations,
        department: doctor.department
      };
    });
  };

  const data = getDoctorData();
  const totalPatients = data.reduce((sum, doctor) => sum + doctor.patients, 0);
  const totalConsultations = data.reduce((sum, doctor) => sum + doctor.consultations, 0);
  const averagePatients = doctors.length ? Math.round(totalPatients / doctors.length) : 0;
  const averageConsultations = doctors.length ? Math.round(totalConsultations / doctors.length) : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Doctor Workload</h2>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as DoctorData;
                  return (
                    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-medium text-gray-900">{data.name}</p>
                      <p className="text-sm text-gray-600">{data.department}</p>
                      <div className="mt-2">
                        <p className="text-sm">
                          <span className="text-indigo-600">Active Patients:</span> {data.patients}
                        </p>
                        <p className="text-sm">
                          <span className="text-green-600">Pending Consultations:</span> {data.consultations}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar 
              dataKey="patients" 
              name="Active Patients" 
              fill="#4f46e5" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="consultations" 
              name="Pending Consultations" 
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm font-medium text-indigo-600">Average Patients per Doctor</p>
          <p className="text-2xl font-bold text-indigo-900">{averagePatients}</p>
          <p className="text-sm text-indigo-600">Total: {totalPatients} patients</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-600">Average Consultations per Doctor</p>
          <p className="text-2xl font-bold text-green-900">{averageConsultations}</p>
          <p className="text-sm text-green-600">Total: {totalConsultations} consultations</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorStats;
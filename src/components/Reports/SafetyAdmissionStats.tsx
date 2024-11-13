import React, { useEffect } from 'react';
import { Shield } from 'lucide-react';
import { usePatientStore } from '../../stores/usePatientStore';
import SafetyPieChart from './SafetyStats/SafetyPieChart';
import SafetyMetrics from './SafetyStats/SafetyMetrics';
import SafetyTypeList from './SafetyStats/SafetyTypeList';
import SafetyLegend from './SafetyStats/SafetyLegend';
import type { Patient } from '../../types/patient';

interface SafetyAdmissionStatsProps {
  dateFilter: {
    startDate: string;
    endDate: string;
    period: string;
  };
}

interface PatientAdmission {
  id: number;
  patient_id: number;
  admitting_doctor_id: number;
  status: 'active' | 'discharged' | 'transferred';
  admission_date: string;
  discharge_date: string | null;
  department: string;
  diagnosis: string;
  visit_number: number;
  safety_type?: 'emergency' | 'observation' | 'short-stay';
  users?: {
    name: string;
  };
}

const SafetyAdmissionStats: React.FC<SafetyAdmissionStatsProps> = ({ dateFilter }) => {
  const { patients, subscribe } = usePatientStore();

  useEffect(() => {
    return subscribe(() => {
      // Component will re-render automatically when store updates
    });
  }, [subscribe]);

  // Get all active admissions within date range
  const activeAdmissions = patients.filter((patient: Patient) => {
    const admissions = patient.admissions as PatientAdmission[] | undefined;
    return admissions?.some(admission => 
      admission.status === 'active' &&
      new Date(admission.admission_date) >= new Date(dateFilter.startDate) &&
      new Date(admission.admission_date) <= new Date(dateFilter.endDate)
    );
  });

  // Calculate safety admission counts
  const safetyData = activeAdmissions.reduce((acc, patient) => {
    const admissions = patient.admissions as PatientAdmission[] | undefined;
    const activeAdmission = admissions?.find(admission => 
      admission.status === 'active' &&
      new Date(admission.admission_date) >= new Date(dateFilter.startDate) &&
      new Date(admission.admission_date) <= new Date(dateFilter.endDate)
    );

    if (activeAdmission?.safety_type) {
      acc[activeAdmission.safety_type] = (acc[activeAdmission.safety_type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Format data for components
  const data = [
    {
      type: 'Emergency',
      count: safetyData['emergency'] || 0,
      color: '#ef4444',
      description: 'Requires immediate medical attention'
    },
    {
      type: 'Observation',
      count: safetyData['observation'] || 0,
      color: '#f59e0b',
      description: 'Needs close monitoring'
    },
    {
      type: 'Short Stay',
      count: safetyData['short-stay'] || 0,
      color: '#10b981',
      description: 'Planned brief admission'
    }
  ];

  // Calculate total safety admissions
  const totalSafetyAdmissions = data.reduce((sum, item) => sum + item.count, 0);

  // Calculate safety rate
  const totalActiveAdmissions = activeAdmissions.length;
  const safetyRate = totalActiveAdmissions > 0 
    ? Math.round((totalSafetyAdmissions / totalActiveAdmissions) * 100) 
    : 0;

  // Calculate average stay duration for discharged safety admissions
  const calculateAverageStay = () => {
    const dischargedSafetyAdmissions = patients.flatMap(patient => {
      const admissions = patient.admissions as PatientAdmission[] | undefined;
      if (!admissions) return [];

      return admissions.filter(admission => 
        admission.safety_type &&
        admission.status === 'discharged' &&
        admission.discharge_date &&
        new Date(admission.admission_date) >= new Date(dateFilter.startDate) &&
        new Date(admission.admission_date) <= new Date(dateFilter.endDate)
      );
    });

    if (dischargedSafetyAdmissions.length === 0) return 0;

    const totalDays = dischargedSafetyAdmissions.reduce((sum, admission) => {
      const admissionDate = new Date(admission.admission_date);
      const dischargeDate = new Date(admission.discharge_date!);
      return sum + Math.ceil((dischargeDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / dischargedSafetyAdmissions.length);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Shield className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Safety Admission Statistics</h2>
            <p className="text-sm text-gray-500">Active safety admissions overview</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SafetyMetrics
            total={totalSafetyAdmissions}
            safetyRate={safetyRate}
            averageStay={calculateAverageStay()}
            emergencyCount={safetyData['emergency'] || 0}
            observationCount={safetyData['observation'] || 0}
            shortStayCount={safetyData['short-stay'] || 0}
          />
          <SafetyLegend />
        </div>
        
        <div className="space-y-6">
          <SafetyPieChart data={data} />
          <SafetyTypeList data={data} total={totalSafetyAdmissions} />
        </div>
      </div>
    </div>
  );
};

export default SafetyAdmissionStats;
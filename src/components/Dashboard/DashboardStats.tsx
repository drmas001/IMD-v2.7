import React from 'react';
import { Users, UserCheck, Clock } from 'lucide-react';
import { usePatientStore } from '../../stores/usePatientStore';
import type { Patient } from '../../types/patient';
import type { Admission } from '../../types/admission';

const DashboardStats: React.FC = () => {
  const { patients } = usePatientStore();
  
  const totalPatients = patients.length;
  const activePatients = patients.filter(patient => 
    patient.admissions?.[0]?.status === 'active'
  ).length;

  const getShiftCounts = () => {
    const counts = {
      morning: 0,
      evening: 0,
      night: 0,
      weekend_morning: 0,
      weekend_night: 0
    };

    patients.forEach(patient => {
      const admissions = patient.admissions as Admission[] | undefined;
      const activeAdmission = admissions?.find(admission => admission.status === 'active');
      if (activeAdmission?.status === 'active' && activeAdmission.shift_type) {
        counts[activeAdmission.shift_type as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const shiftCounts = getShiftCounts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Total Patients</h3>
        </div>
        <p className="text-3xl font-bold text-gray-900">{totalPatients}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <UserCheck className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Active Patients</h3>
        </div>
        <p className="text-3xl font-bold text-gray-900">{activePatients}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Current Shifts</h3>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Regular Shifts</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <span className="text-xs text-gray-500 block">Morning</span>
                <span className="text-sm font-medium text-gray-900">{shiftCounts.morning}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <span className="text-xs text-gray-500 block">Evening</span>
                <span className="text-sm font-medium text-gray-900">{shiftCounts.evening}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <span className="text-xs text-gray-500 block">Night</span>
                <span className="text-sm font-medium text-gray-900">{shiftCounts.night}</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Weekend Shifts</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <span className="text-xs text-gray-500 block">Day</span>
                <span className="text-sm font-medium text-gray-900">{shiftCounts.weekend_morning}</span>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <span className="text-xs text-gray-500 block">Night</span>
                <span className="text-sm font-medium text-gray-900">{shiftCounts.weekend_night}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
import React, { useState } from 'react';
import { Calendar, Clock, Download, FileText, Filter, Printer, MessageSquare } from 'lucide-react';
import { usePatientStore } from '../../stores/usePatientStore';
import { formatDate } from '../../utils/dateFormat';
import { calculateStayDuration, LONG_STAY_THRESHOLD } from '../../utils/stayCalculator';
import { exportLongStayReport } from '../../utils/reportExport';
import LongStayBadge from '../LongStay/LongStayBadge';
import SafetyBadge from '../PatientProfile/SafetyBadge';
import LongStayNotes from './LongStayNotes';
import type { Patient } from '../../types/patient';

interface LongStayFilters {
  specialty: string;
  minDuration: number;
  sortBy: 'duration' | 'date';
  searchQuery: string;
}

const specialties = [
  'All Specialties',
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
];

const LongStayReports: React.FC = () => {
  const { patients } = usePatientStore();
  const [filters, setFilters] = useState<LongStayFilters>({
    specialty: 'All Specialties',
    minDuration: LONG_STAY_THRESHOLD,
    sortBy: 'duration',
    searchQuery: ''
  });
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showNotes, setShowNotes] = useState(false);

  const longStayPatients = patients
    .filter((patient: Patient) => {
      const admission = patient.admissions?.[0];
      if (!admission) return false;

      const stayDuration = calculateStayDuration(admission.admission_date);
      const matchesSpecialty = filters.specialty === 'All Specialties' || admission.department === filters.specialty;
      const matchesDuration = stayDuration >= filters.minDuration;
      const matchesSearch = filters.searchQuery === '' || 
        patient.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(filters.searchQuery.toLowerCase());

      return matchesSpecialty && matchesDuration && matchesSearch;
    })
    .sort((a: Patient, b: Patient) => {
      const admissionA = a.admissions?.[0];
      const admissionB = b.admissions?.[0];
      if (!admissionA || !admissionB) return 0;

      if (filters.sortBy === 'duration') {
        const durationA = calculateStayDuration(admissionA.admission_date);
        const durationB = calculateStayDuration(admissionB.admission_date);
        return durationB - durationA;
      } else {
        return new Date(admissionB.admission_date).getTime() - new Date(admissionA.admission_date).getTime();
      }
    });

  const handleExport = () => {
    exportLongStayReport(longStayPatients, {
      specialty: filters.specialty === 'All Specialties' ? undefined : filters.specialty
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Long Stay Patients</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <select
                value={filters.specialty}
                onChange={(e) => setFilters(prev => ({ ...prev, specialty: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Stay Duration
              </label>
              <input
                type="number"
                value={filters.minDuration}
                onChange={(e) => setFilters(prev => ({ ...prev, minDuration: parseInt(e.target.value) || LONG_STAY_THRESHOLD }))}
                min={1}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as 'duration' | 'date' }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value="duration">Stay Duration</option>
                <option value="date">Admission Date</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  placeholder="Search by name or MRN..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {longStayPatients.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Long Stay Patients</h3>
              <p className="text-gray-500">
                No patients found with stays longer than {filters.minDuration} days
              </p>
            </div>
          ) : (
            longStayPatients.map(patient => {
              const admission = patient.admissions?.[0];
              if (!admission) return null;

              const stayDuration = calculateStayDuration(admission.admission_date);

              return (
                <div
                  key={patient.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                        <LongStayBadge 
                          admissionDate={admission.admission_date}
                          showDuration={true}
                        />
                        {admission.safety_type && (
                          <SafetyBadge type={admission.safety_type} />
                        )}
                        <button
                          onClick={() => {
                            setSelectedPatientId(patient.id);
                            setShowNotes(true);
                          }}
                          className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">Notes</span>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">MRN: {patient.mrn}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">Admission Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(admission.admission_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Department</p>
                          <p className="text-sm font-medium text-gray-900">
                            {admission.department}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Attending Doctor</p>
                          <p className="text-sm font-medium text-gray-900">
                            {admission.users?.name || 'Not assigned'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Stay Duration</p>
                          <p className="text-sm font-medium text-gray-900">
                            {stayDuration} days
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selectedPatientId && (
        <LongStayNotes
          patientId={selectedPatientId}
          isOpen={showNotes}
          onClose={() => {
            setShowNotes(false);
            setSelectedPatientId(null);
          }}
        />
      )}
    </div>
  );
};

export default LongStayReports;